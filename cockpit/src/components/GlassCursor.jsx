/*
 更新时间: 2026-06-24
 更新内容: 用官方 ReactBits FluidGlass 的 lens.glb + FBO buffer 思路重做鼠标玻璃指针：
          html2canvas 抓取当前看板作为折射纹理，MeshTransmissionMaterial 只在跟随鼠标的镜片里显示折射效果；
          增加程序化点阵纹理兜底，避免现代 CSS 解析失败时指针消失。
*/
import * as THREE from 'three';
import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, useFBO, MeshTransmissionMaterial, Environment, Lightformer } from '@react-three/drei';
import { easing } from 'maath';
import html2canvas from 'html2canvas';
import './GlassCursor.css';

useGLTF.preload('/assets/3d/lens.glb');

const TARGET_PX = 92;
const LENS = {
  ior: 1.15,
  thickness: 2.4,
  anisotropy: 0.01,
  chromaticAberration: 0.14,
  roughness: 0.02,
};

function makeFallbackCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const gradient = ctx.createLinearGradient(0, 0, window.innerWidth, window.innerHeight);
  gradient.addColorStop(0, '#151517');
  gradient.addColorStop(1, '#050506');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (let y = 8; y < window.innerHeight; y += 16) {
    for (let x = 8; x < window.innerWidth; x += 16) {
      ctx.beginPath();
      ctx.arc(x, y, 0.65, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return canvas;
}

function CapturePlane({ texture }) {
  const { viewport, camera } = useThree();
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 0]);
    ref.current.scale.set(v.width, v.height, 1);
  });

  return (
    <mesh ref={ref} position={[0, 0, 0]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function LensScene({ texture }) {
  const { nodes } = useGLTF('/assets/3d/lens.glb');
  const lensRef = useRef();
  const geoW = useRef(1);
  const mouse = useRef({ x: 0, y: 0 });
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());
  const { gl, viewport, camera } = useThree();

  useEffect(() => {
    const geo = nodes.Cylinder?.geometry;
    if (geo) {
      geo.computeBoundingBox();
      geoW.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
    }
  }, [nodes]);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame((state, delta) => {
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    const destX = (mouse.current.x * v.width) / 2;
    const destY = (mouse.current.y * v.height) / 2;

    if (lensRef.current) {
      easing.damp3(lensRef.current.position, [destX, destY, 15], 0.12, delta);
      const worldPerPx = v.width / window.innerWidth;
      lensRef.current.scale.setScalar((TARGET_PX * worldPerPx) / geoW.current);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  return (
    <>
      {createPortal(<CapturePlane texture={texture} />, scene)}
      <mesh ref={lensRef} rotation-x={Math.PI / 2} geometry={nodes.Cylinder?.geometry}>
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          transmission={1}
          ior={LENS.ior}
          thickness={LENS.thickness}
          anisotropy={LENS.anisotropy}
          chromaticAberration={LENS.chromaticAberration}
          roughness={LENS.roughness}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={1.2}
          transparent
          opacity={0.72}
        />
      </mesh>
      <Environment resolution={128}>
        <Lightformer intensity={1.8} position={[0, 3, 4]} scale={[10, 10, 1]} color="#ffffff" />
        <Lightformer intensity={1.1} position={[-5, -1, 2]} scale={[6, 10, 1]} color="#cccccc" />
        <Lightformer intensity={0.8} position={[5, 1, 3]} scale={[6, 6, 1]} color="#777777" />
      </Environment>
    </>
  );
}

export default function GlassCursor() {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    document.body.classList.add('glass-cursor-on');
    return () => document.body.classList.remove('glass-cursor-on');
  }, []);

  useEffect(() => {
    let alive = true;
    let timer;

    const capture = async () => {
      let canvas;
      try {
        canvas = await html2canvas(document.body, {
          backgroundColor: null,
          width: window.innerWidth,
          height: window.innerHeight,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          scrollX: -window.scrollX,
          scrollY: -window.scrollY,
          scale: Math.min(window.devicePixelRatio || 1, 2),
          logging: false,
          useCORS: true,
          ignoreElements: (el) =>
            el.classList?.contains('glass-cursor-fixed') ||
            el.classList?.contains('glass-surface') ||
            el.classList?.contains('glass-surface__filter'),
        });
      } catch {
        canvas = makeFallbackCanvas();
      }
      if (!alive) return;
      const next = new THREE.CanvasTexture(canvas);
      next.colorSpace = THREE.SRGBColorSpace;
      next.minFilter = THREE.LinearFilter;
      next.magFilter = THREE.LinearFilter;
      next.generateMipmaps = false;
      setTexture((prev) => {
        prev?.dispose?.();
        return next;
      });
    };

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        capture().catch(() => {});
      }, 180);
    };

    schedule();
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });

    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, []);

  if (!texture) return null;

  return (
    <div className="glass-cursor-fixed">
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <LensScene texture={texture} />
        </Suspense>
      </Canvas>
    </div>
  );
}
