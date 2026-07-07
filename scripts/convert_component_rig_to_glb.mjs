/*
 更新时间: 2026-07-07 13:22:15 CST
 更新内容: 提高 AI 小人 GLB 默认几何保留率与配色 FBX 取样密度，改善颜色错配和细节不足。
*/
/*
 更新时间: 2026-07-07 13:02:18 CST
 更新内容: 支持从用户配色 FBX 提取 base color 贴图，并将颜色转移为可动 GLB 的顶点色。
*/
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
const DEFAULT_RATIO = 0.18;
const DEFAULT_COLOR_SOURCE_STRIDE = 1;
const COLOR_GRID_SIZE = 0.018;
const MIN_COLOR_SEARCH_RADIUS = 1;
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const cockpitRequire = createRequire(new URL('../cockpit/package.json', import.meta.url));
const { PNG } = cockpitRequire('pngjs');
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

function installFbxBrowserPolyfills() {
  globalThis.window ??= {};
  globalThis.window.URL ??= { createObjectURL: () => '' };
  globalThis.window.webkitURL ??= globalThis.window.URL;
  globalThis.document ??= {
    createElementNS: (_namespace, name) => {
      const listeners = new Map();
      return {
        nodeName: name,
        width: 1,
        height: 1,
        complete: true,
        addEventListener(type, callback) {
          listeners.set(type, callback);
        },
        removeEventListener(type) {
          listeners.delete(type);
        },
        set src(value) {
          this._src = value;
          queueMicrotask(() => listeners.get('load')?.({ target: this }));
        },
        get src() {
          return this._src || '';
        },
      };
    },
  };
}

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
    colorSource: '',
    colorSourceStride: DEFAULT_COLOR_SOURCE_STRIDE,
    output: DEFAULT_OUTPUT,
    ratio: DEFAULT_RATIO,
  };

  for (const arg of argv) {
    if (arg.startsWith('--ratio=')) {
      options.ratio = Number(arg.slice('--ratio='.length));
    } else if (arg.startsWith('--color-source=')) {
      options.colorSource = resolve(arg.slice('--color-source='.length));
    } else if (arg.startsWith('--color-stride=')) {
      options.colorSourceStride = Number(arg.slice('--color-stride='.length));
    } else if (arg.startsWith('--output=')) {
      options.output = resolve(ROOT, arg.slice('--output='.length));
    } else if (!options.input) {
      options.input = resolve(arg);
    } else {
      options.output = resolve(arg);
    }
  }

  if (!options.input) {
    throw new Error('Usage: node scripts/convert_component_rig_to_glb.mjs <input.fbx> [output.glb] [--ratio=0.18] [--color-source=colored.fbx]');
  }

  if (!Number.isFinite(options.ratio) || options.ratio <= 0 || options.ratio > 1) {
    throw new Error('--ratio must be a number between 0 and 1');
  }

  if (!Number.isInteger(options.colorSourceStride) || options.colorSourceStride < 1) {
    throw new Error('--color-stride must be a positive integer');
  }

  return options;
}

function readFbxModel(input) {
  installFbxBrowserPolyfills();
  const bytes = readFileSync(input);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new FBXLoader().parse(buffer, '');
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

function extractPngAt(bytes, offset) {
  let cursor = offset + PNG_SIGNATURE.length;

  while (cursor < bytes.length) {
    const length = bytes.readUInt32BE(cursor);
    const chunkType = bytes.toString('ascii', cursor + 4, cursor + 8);
    cursor += 8 + length + 4;

    if (chunkType === 'IEND') {
      return bytes.subarray(offset, cursor);
    }
  }

  throw new Error('PNG IEND chunk was not found in color-source FBX');
}

function extractBaseColorTexture(colorSource) {
  const bytes = readFileSync(colorSource);
  const label = Buffer.from('base_color_texture');
  const labelOffset = bytes.indexOf(label);
  const searchOffset = labelOffset >= 0 ? labelOffset : 0;
  const pngOffset = bytes.indexOf(PNG_SIGNATURE, searchOffset);

  if (pngOffset < 0) {
    throw new Error(`No embedded PNG base color texture found in ${colorSource}`);
  }

  return PNG.sync.read(extractPngAt(bytes, pngOffset));
}

function getWorldBounds(model) {
  model.updateMatrixWorld(true);
  const box = new Box3().setFromObject(model);
  const size = new Vector3();
  const center = new Vector3();
  box.getSize(size);
  box.getCenter(center);

  return {
    box,
    center,
    scale: 1 / size.y,
  };
}

function getNormalizedPoint(point, bounds) {
  return [
    (point.x - bounds.center.x) * bounds.scale,
    (point.y - bounds.box.min.y) * bounds.scale,
    (point.z - bounds.center.z) * bounds.scale,
  ];
}

function wrapUnit(value) {
  return value - Math.floor(value);
}

function sampleTexture(texture, u, v) {
  const x = Math.min(texture.width - 1, Math.max(0, Math.floor(wrapUnit(u) * texture.width)));
  const y = Math.min(texture.height - 1, Math.max(0, Math.floor((1 - wrapUnit(v)) * texture.height)));
  const index = (y * texture.width + x) * 4;

  return [
    texture.data[index],
    texture.data[index + 1],
    texture.data[index + 2],
  ];
}

function cellKey(x, y, z) {
  return `${Math.floor(x / COLOR_GRID_SIZE)},${Math.floor(y / COLOR_GRID_SIZE)},${Math.floor(z / COLOR_GRID_SIZE)}`;
}

function createColorSampler(sourceModel, texture, stride) {
  const sourceBounds = getWorldBounds(sourceModel);
  const meshes = [];
  let sampleCount = 0;

  sourceModel.traverse((node) => {
    if (!node.isMesh) return;
    const position = node.geometry.getAttribute('position');
    const uv = node.geometry.getAttribute('uv');
    if (!position || !uv) return;

    meshes.push({ node, position, uv });
    sampleCount += Math.ceil(position.count / stride);
  });

  if (sampleCount === 0) {
    throw new Error('Color-source FBX must contain at least one mesh with UV coordinates');
  }

  const positions = new Float32Array(sampleCount * 3);
  const colors = new Uint8Array(sampleCount * 3);
  const grid = new Map();
  const point = new Vector3();
  let writeIndex = 0;

  for (const { node, position, uv } of meshes) {
    for (let vertexIndex = 0; vertexIndex < position.count; vertexIndex += stride) {
      point.fromBufferAttribute(position, vertexIndex).applyMatrix4(node.matrixWorld);
      const normalized = getNormalizedPoint(point, sourceBounds);
      const color = sampleTexture(texture, uv.getX(vertexIndex), uv.getY(vertexIndex));

      positions[writeIndex * 3] = normalized[0];
      positions[writeIndex * 3 + 1] = normalized[1];
      positions[writeIndex * 3 + 2] = normalized[2];
      colors[writeIndex * 3] = color[0];
      colors[writeIndex * 3 + 1] = color[1];
      colors[writeIndex * 3 + 2] = color[2];

      const key = cellKey(normalized[0], normalized[1], normalized[2]);
      const bucket = grid.get(key);
      if (bucket) bucket.push(writeIndex);
      else grid.set(key, [writeIndex]);

      writeIndex += 1;
    }
  }

  return {
    sampleCount,
    findColor(x, y, z) {
      const cx = Math.floor(x / COLOR_GRID_SIZE);
      const cy = Math.floor(y / COLOR_GRID_SIZE);
      const cz = Math.floor(z / COLOR_GRID_SIZE);
      let bestIndex = -1;
      let bestDistance = Infinity;

      for (let radius = 0; radius <= 8; radius += 1) {
        for (let ix = cx - radius; ix <= cx + radius; ix += 1) {
          for (let iy = cy - radius; iy <= cy + radius; iy += 1) {
            for (let iz = cz - radius; iz <= cz + radius; iz += 1) {
              const bucket = grid.get(`${ix},${iy},${iz}`);
              if (!bucket) continue;

              for (const index of bucket) {
                const dx = positions[index * 3] - x;
                const dy = positions[index * 3 + 1] - y;
                const dz = positions[index * 3 + 2] - z;
                const distance = dx * dx + dy * dy + dz * dz;
                if (distance < bestDistance) {
                  bestDistance = distance;
                  bestIndex = index;
                }
              }
            }
          }
        }

        if (bestIndex >= 0 && radius >= MIN_COLOR_SEARCH_RADIUS) break;
      }

      if (bestIndex < 0) return [1, 1, 1];
      return [
        colors[bestIndex * 3] / 255,
        colors[bestIndex * 3 + 1] / 255,
        colors[bestIndex * 3 + 2] / 255,
      ];
    },
  };
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

function assignVertexColorsFromSource(node, colorSampler, targetBounds) {
  const position = node.geometry.getAttribute('position');
  if (!position) return 0;

  const colors = new Float32Array(position.count * 3);
  const point = new Vector3();

  node.updateMatrixWorld(true);
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position, index).applyMatrix4(node.matrixWorld);
    const [x, y, z] = getNormalizedPoint(point, targetBounds);
    const [r, g, b] = colorSampler.findColor(x, y, z);

    colors[index * 3] = r;
    colors[index * 3 + 1] = g;
    colors[index * 3 + 2] = b;
  }

  node.geometry.setAttribute('color', new BufferAttribute(colors, 3));
  return position.count;
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

function optimizeModel(model, ratio, simplifier, colorSampler = null) {
  const stats = [];
  const targetBounds = colorSampler ? getWorldBounds(model) : null;

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
    const coloredVertices = colorSampler ? assignVertexColorsFromSource(node, colorSampler, targetBounds) : 0;

    stats.push({
      name: node.name,
      beforeVertices,
      weldedVertices,
      weldedIndices,
      finalVertices: node.geometry.getAttribute('position')?.count || 0,
      finalIndices: node.geometry.index?.count || 0,
      coloredVertices,
      error: simplified.error,
      color: `#${color.getHexString()}`,
    });

    node.material = new MeshStandardMaterial({
      name: `${node.name || 'mesh'}-material`,
      color: colorSampler ? new Color(0xffffff) : color,
      vertexColors: Boolean(colorSampler),
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

  const model = readFbxModel(options.input);
  const colorSampler = options.colorSource
    ? createColorSampler(readFbxModel(options.colorSource), extractBaseColorTexture(options.colorSource), options.colorSourceStride)
    : null;
  const stats = optimizeModel(model, options.ratio, simplifier, colorSampler);

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
    colorSource: options.colorSource || null,
    colorSamples: colorSampler?.sampleCount ?? 0,
    parts: stats,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
