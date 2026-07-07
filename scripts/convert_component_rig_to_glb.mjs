/*
 更新时间: 2026-07-07 12:24:46 CST
 更新内容: 新增 FBX 小人骨骼模型轻量化转换脚本，输出当前页面使用的可动作 GLB 资产。
*/
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_OUTPUT = resolve(ROOT, 'cockpit/public/models/ai-mascot.glb');
const DEFAULT_RATIO = 0.05;
const cockpitRequire = createRequire(new URL('../cockpit/package.json', import.meta.url));
let BufferAttribute;
let Box3;
let Color;
let FBXLoader;
let GLTFExporter;
let MeshStandardMaterial;
let Vector3;
let mergeVertices;
const CONTROL_RENAMES = {
  CTRL_Rig_Root: 'MascotRoot',
  CTRL_Body: 'BodyCtrl',
  CTRL_Head: 'HeadCtrl',
  CTRL_L_Arm: 'LeftArmCtrl',
  CTRL_R_Arm: 'RightArmCtrl',
  CTRL_L_Foot: 'LeftLegCtrl',
  CTRL_R_Foot: 'RightLegCtrl',
};

globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, init = {}) {
    this.type = type;
    Object.assign(this, init);
  }
};

globalThis.FileReader ??= class FileReader {
  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    this.onloadend?.({ target: this });
  }

  async readAsDataURL(blob) {
    const buffer = await blob.arrayBuffer();
    const mediaType = blob.type || 'application/octet-stream';
    this.result = `data:${mediaType};base64,${Buffer.from(buffer).toString('base64')}`;
    this.onloadend?.({ target: this });
  }
};

async function loadMeshoptSimplifier() {
  try {
    return (await import(pathToFileURL(cockpitRequire.resolve('meshoptimizer')))).MeshoptSimplifier;
  } catch {
    const pnpmPackage = new URL('../cockpit/node_modules/.pnpm/meshoptimizer@1.1.1/node_modules/meshoptimizer/index.js', import.meta.url);
    return (await import(pnpmPackage)).MeshoptSimplifier;
  }
}

async function loadThreeModules() {
  const three = await import(pathToFileURL(cockpitRequire.resolve('three')));
  const fbx = await import(pathToFileURL(cockpitRequire.resolve('three/examples/jsm/loaders/FBXLoader.js')));
  const gltf = await import(pathToFileURL(cockpitRequire.resolve('three/examples/jsm/exporters/GLTFExporter.js')));
  const geometryUtils = await import(pathToFileURL(cockpitRequire.resolve('three/examples/jsm/utils/BufferGeometryUtils.js')));

  BufferAttribute = three.BufferAttribute;
  Box3 = three.Box3;
  Color = three.Color;
  MeshStandardMaterial = three.MeshStandardMaterial;
  Vector3 = three.Vector3;
  FBXLoader = fbx.FBXLoader;
  GLTFExporter = gltf.GLTFExporter;
  mergeVertices = geometryUtils.mergeVertices;
}

function parseArgs(argv) {
  const options = {
    input: '',
    output: DEFAULT_OUTPUT,
    ratio: DEFAULT_RATIO,
  };

  for (const arg of argv) {
    if (arg.startsWith('--ratio=')) {
      options.ratio = Number(arg.slice('--ratio='.length));
    } else if (arg.startsWith('--output=')) {
      options.output = resolve(ROOT, arg.slice('--output='.length));
    } else if (!options.input) {
      options.input = resolve(arg);
    } else {
      options.output = resolve(arg);
    }
  }

  if (!options.input) {
    throw new Error('Usage: node scripts/convert_component_rig_to_glb.mjs <input.fbx> [output.glb] [--ratio=0.05]');
  }

  if (!Number.isFinite(options.ratio) || options.ratio <= 0 || options.ratio > 1) {
    throw new Error('--ratio must be a number between 0 and 1');
  }

  return options;
}

function getMaterialColor(geometry, fallback) {
  const color = geometry.getAttribute('color');
  if (!color || color.count === 0) return fallback;
  return new Color(color.getX(0), color.getY(0), color.getZ(0));
}

function compactGeometry(geometry, simplifier) {
  const position = geometry.getAttribute('position');
  const index = geometry.index;
  if (!position || !index) return geometry;

  const indices = index.array instanceof Uint32Array ? new Uint32Array(index.array) : new Uint32Array(index.array);
  const [remap, unique] = simplifier.compactMesh(indices);
  const missing = 2 ** 32 - 1;
  const oldPositions = position.array;
  const newPositions = new Float32Array(unique * 3);

  for (let oldIndex = 0; oldIndex < remap.length; oldIndex += 1) {
    const newIndex = remap[oldIndex];
    if (newIndex === missing) continue;

    newPositions[newIndex * 3] = oldPositions[oldIndex * 3];
    newPositions[newIndex * 3 + 1] = oldPositions[oldIndex * 3 + 1];
    newPositions[newIndex * 3 + 2] = oldPositions[oldIndex * 3 + 2];
  }

  geometry.setAttribute('position', new BufferAttribute(newPositions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}

function simplifyGeometry(geometry, ratio, simplifier) {
  const position = geometry.getAttribute('position');
  const index = geometry.index;
  if (!position || !index) return { geometry, error: 0 };

  const indices = index.array instanceof Uint32Array ? index.array : new Uint32Array(index.array);
  const targetIndexCount = Math.max(3, Math.floor(indices.length * ratio / 3) * 3);
  const [simplified, error] = simplifier.simplify(indices, position.array, 3, targetIndexCount, 0.04);

  geometry.setIndex(new BufferAttribute(simplified, 1));
  geometry = compactGeometry(geometry, simplifier);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return { geometry, error };
}

function normalizeModel(model) {
  const box = new Box3().setFromObject(model);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  const scale = 1 / size.y;
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
}

function optimizeModel(model, ratio, simplifier) {
  const stats = [];

  model.traverse((node) => {
    if (CONTROL_RENAMES[node.name]) node.name = CONTROL_RENAMES[node.name];
    node.frustumCulled = false;

    if (!node.isMesh) return;

    const sourceMaterial = Array.isArray(node.material) ? node.material[0] : node.material;
    const fallbackColor = sourceMaterial?.color?.isColor ? sourceMaterial.color : new Color(0xffffff);
    const color = getMaterialColor(node.geometry, fallbackColor);
    const beforeVertices = node.geometry.getAttribute('position')?.count || 0;

    node.geometry.deleteAttribute('color');
    node.geometry.deleteAttribute('normal');
    node.geometry = mergeVertices(node.geometry, 1e-4);

    const weldedVertices = node.geometry.getAttribute('position')?.count || 0;
    const weldedIndices = node.geometry.index?.count || 0;
    const simplified = simplifyGeometry(node.geometry, ratio, simplifier);
    node.geometry = simplified.geometry;

    stats.push({
      name: node.name,
      beforeVertices,
      weldedVertices,
      weldedIndices,
      finalVertices: node.geometry.getAttribute('position')?.count || 0,
      finalIndices: node.geometry.index?.count || 0,
      error: simplified.error,
      color: `#${color.getHexString()}`,
    });

    node.material = new MeshStandardMaterial({
      name: `${node.name || 'mesh'}-material`,
      color,
      roughness: 0.58,
      metalness: 0.04,
    });
  });

  normalizeModel(model);
  return stats;
}

async function exportGlb(model, output) {
  const result = await new GLTFExporter().parseAsync(model, {
    binary: true,
    trs: false,
    onlyVisible: false,
  });
  const bytes = result instanceof ArrayBuffer ? new Uint8Array(result) : Buffer.from(JSON.stringify(result));
  writeFileSync(output, bytes);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!existsSync(options.input)) {
    throw new Error(`Input FBX does not exist: ${options.input}`);
  }

  await loadThreeModules();
  const simplifier = await loadMeshoptSimplifier();
  await simplifier.ready;

  const bytes = readFileSync(options.input);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const model = new FBXLoader().parse(buffer, '');
  const stats = optimizeModel(model, options.ratio, simplifier);

  await exportGlb(model, options.output);

  const finalSize = statSync(options.output).size;
  const totalVertices = stats.reduce((sum, row) => sum + row.finalVertices, 0);
  const totalTriangles = stats.reduce((sum, row) => sum + row.finalIndices / 3, 0);

  console.log(JSON.stringify({
    input: options.input,
    output: options.output,
    ratio: options.ratio,
    finalSize,
    totalVertices,
    totalTriangles,
    parts: stats,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
