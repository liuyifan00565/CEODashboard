/*
 更新时间: 2026-07-01 11:06:18
 更新内容: 福小客分析电脑改为右侧双手托举姿势，并保持原图角色不变。
*/
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const MASCOT_IMAGE_WIDTH = 1084;
const MASCOT_IMAGE_HEIGHT = 1451;
const MASCOT_STAGE_HEIGHT = 2.04;
const MASCOT_STAGE_WIDTH = MASCOT_STAGE_HEIGHT * (MASCOT_IMAGE_WIDTH / MASCOT_IMAGE_HEIGHT);
const DEFAULT_POINTER = { x: 0, y: 0, active: false };

function getDesktopPetMotion(action = MASCOT_ACTIONS.idle, t = 0, pointer = DEFAULT_POINTER, analysisActive = false) {
  const pointerX = pointer.active ? pointer.x : Math.sin(t * 0.72) * 0.18;
  const pointerY = pointer.active ? pointer.y : Math.cos(t * 0.64) * 0.12;
  const idleFloat = Math.sin(t * 1.25) * 0.035;
  const bounce = Math.abs(Math.sin(t * 4.6));
  const isAnalyzing = analysisActive || action === MASCOT_ACTIONS.think || action === MASCOT_ACTIONS.talk || action === MASCOT_ACTIONS.click;
  const flyLift = isAnalyzing ? 0.18 + Math.abs(Math.sin(t * 2.4)) * 0.045 : 0;

  const motion = {
    x: pointerX * 0.1,
    y: idleFloat - pointerY * 0.055 + flyLift,
    tilt: pointerX * -0.12 + Math.sin(t * 1.1) * 0.018,
    scale: isAnalyzing ? 1.035 : 1,
    laptopOpacity: isAnalyzing ? 1 : 0,
  };

  if (action === MASCOT_ACTIONS.wave) {
    motion.x += pointerX * 0.035;
    motion.y += bounce * 0.055;
    motion.tilt += 0.05 * Math.sin(t * 5.2);
    motion.scale = 1.02;
  }

  if (action === MASCOT_ACTIONS.alert) {
    motion.y += bounce * 0.06;
    motion.tilt += Math.sin(t * 8.2) * 0.05;
    motion.scale = 1.045;
  }

  if (action === MASCOT_ACTIONS.celebrate) {
    motion.y += bounce * 0.14;
    motion.tilt += Math.sin(t * 4.8) * 0.055;
    motion.scale = 1.055;
  }

  if (action === MASCOT_ACTIONS.click) {
    motion.y += bounce * 0.09;
    motion.scale = 1.06 - bounce * 0.018;
  }

  return motion;
}

function MascotImage({ meshRef }) {
  const texture = useTexture('/ai-mascot-transparent.png');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return (
    <mesh ref={meshRef} frustumCulled={false}>
      <planeGeometry args={[MASCOT_STAGE_WIDTH, MASCOT_STAGE_HEIGHT]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
        alphaTest={0.02}
      />
    </mesh>
  );
}

function LaptopLine({ x, y, width, color = '#62e7ff' }) {
  return (
    <mesh position={[x, y, 0.014]}>
      <planeGeometry args={[width, 0.014]} />
      <meshBasicMaterial color={color} transparent opacity={0.82} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function LaptopGripHand({ x, y, rotation = 0 }) {
  return (
    <group position={[x, y, 0.035]} rotation={[0, 0, rotation]}>
      <mesh scale={[1.22, 0.74, 1]}>
        <circleGeometry args={[0.095, 32]} />
        <meshBasicMaterial color="#f5f8ff" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh position={[0, -0.065, -0.002]} rotation={[0, 0, -rotation * 0.35]}>
        <planeGeometry args={[0.18, 0.05]} />
        <meshBasicMaterial color="#6b35f4" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh position={[0, -0.037, 0.002]} rotation={[0, 0, -rotation * 0.35]}>
        <planeGeometry args={[0.13, 0.014]} />
        <meshBasicMaterial color="#7ddfff" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
    </group>
  );
}

function AnalysisLaptop({ laptopRef }) {
  return (
    <group ref={laptopRef} position={[0.56, -0.36, 0.18]} rotation={[0, 0, -0.08]} visible={false}>
      <mesh position={[0, 0.05, 0]}>
        <planeGeometry args={[0.68, 0.42]} />
        <meshBasicMaterial color="#0d1230" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh position={[0, -0.155, 0.006]}>
        <planeGeometry args={[0.78, 0.09]} />
        <meshBasicMaterial color="#e8f6ff" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
      <mesh position={[0, 0.05, 0.01]}>
        <planeGeometry args={[0.56, 0.31]} />
        <meshBasicMaterial color="#151a45" transparent opacity={0} toneMapped={false} depthWrite={false} depthTest={false} />
      </mesh>
      <LaptopLine x={-0.11} y={0.145} width={0.28} />
      <LaptopLine x={0.05} y={0.076} width={0.39} color="#b48cff" />
      <LaptopLine x={-0.04} y={0.005} width={0.26} color="#f472b6" />
      <LaptopLine x={0.11} y={-0.066} width={0.2} color="#67f6c8" />
      <LaptopGripHand x={-0.34} y={-0.1} rotation={0.18} />
      <LaptopGripHand x={0.34} y={-0.105} rotation={-0.2} />
    </group>
  );
}

function MascotPuppet({ action, pointer, analysisActive }) {
  const group = useRef(null);
  const mascotRef = useRef(null);
  const laptopRef = useRef(null);
  const pointerTarget = useRef({ x: 0, y: 0 }).current;

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const motion = getDesktopPetMotion(action, t, pointer, analysisActive);

    pointerTarget.x = THREE.MathUtils.lerp(pointerTarget.x, motion.x, 0.12);
    pointerTarget.y = THREE.MathUtils.lerp(pointerTarget.y, motion.y, 0.12);
    group.current.position.x = pointerTarget.x;
    group.current.position.y = pointerTarget.y;
    group.current.rotation.z = motion.tilt;
    group.current.scale.set(motion.scale, motion.scale, 1);

    if (mascotRef.current) {
      mascotRef.current.position.y = Math.sin(t * 2.1) * 0.012;
    }

    if (laptopRef.current) {
      laptopRef.current.visible = motion.laptopOpacity > 0.05;
      laptopRef.current.position.y = -0.36 + Math.sin(t * 3.2) * 0.018;
      laptopRef.current.rotation.z = Math.sin(t * 2.6) * 0.018;
      laptopRef.current.traverse((node) => {
        const material = node.material;
        if (material) material.opacity = motion.laptopOpacity;
      });
    }
  });

  return (
    <group ref={group}>
      <MascotImage meshRef={mascotRef} />
      <AnalysisLaptop laptopRef={laptopRef} />
    </group>
  );
}

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  return (
    <span className="mascot-3d-stage" role="img" aria-label={label}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 5], zoom: 64 }}
        dpr={[1, 1.7]}
        gl={{ alpha: true, antialias: true }}
      >
        <MascotPuppet action={action} pointer={pointer} analysisActive={analysisActive} />
      </Canvas>
    </span>
  );
}
