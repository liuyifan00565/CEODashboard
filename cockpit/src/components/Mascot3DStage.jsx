/*
 更新时间: 2026-07-01 11:47:04
 更新内容: 移除福小客动作缩放，仅保留位移与倾斜，确保所有动作不改变小人尺寸。
*/
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const MASCOT_IMAGE_WIDTH = 1084;
const MASCOT_IMAGE_HEIGHT = 1451;
const MASCOT_ANALYSIS_IMAGE_WIDTH = MASCOT_IMAGE_WIDTH;
const MASCOT_ANALYSIS_IMAGE_HEIGHT = MASCOT_IMAGE_HEIGHT;
const MASCOT_STAGE_HEIGHT = 2.04;
const MASCOT_STAGE_WIDTH = MASCOT_STAGE_HEIGHT * (MASCOT_IMAGE_WIDTH / MASCOT_IMAGE_HEIGHT);
const MASCOT_ANALYSIS_STAGE_WIDTH = MASCOT_STAGE_WIDTH;
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
    scale: 1,
    analysisPoseOpacity: isAnalyzing ? 1 : 0,
  };

  if (action === MASCOT_ACTIONS.wave) {
    motion.x += pointerX * 0.035;
    motion.y += bounce * 0.055;
    motion.tilt += 0.075 * Math.sin(t * 6.4);
  }

  if (action === MASCOT_ACTIONS.think) {
    motion.x += Math.sin(t * 1.45) * 0.012 + pointerX * 0.025;
    motion.y += Math.sin(t * 2.8) * 0.022;
    motion.tilt += Math.sin(t * 1.7) * 0.042;
  }

  if (action === MASCOT_ACTIONS.talk) {
    motion.x += Math.sin(t * 3.6) * 0.008;
    motion.y += Math.sin(t * 5.8) * 0.012;
    motion.tilt += Math.sin(t * 4.2) * 0.025;
  }

  if (action === MASCOT_ACTIONS.alert) {
    motion.x += Math.sin(t * 12) * 0.012;
    motion.y += bounce * 0.07;
    motion.tilt += Math.sin(t * 8.2) * 0.06;
  }

  if (action === MASCOT_ACTIONS.celebrate) {
    motion.y += Math.pow(bounce, 1.4) * 0.18;
    motion.tilt += Math.sin(t * 5.2) * 0.065;
  }

  if (action === MASCOT_ACTIONS.click) {
    motion.y += Math.pow(bounce, 1.7) * 0.105;
    motion.tilt += Math.sin(t * 7.5) * 0.025;
  }

  return motion;
}

function MascotImage({
  meshRef,
  materialRef,
  source = '/ai-mascot-transparent.png',
  width = MASCOT_STAGE_WIDTH,
  height = MASCOT_STAGE_HEIGHT,
  z = 0,
  initialOpacity = 1,
}) {
  const texture = useTexture(source);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return (
    <mesh ref={meshRef} position={[0, 0, z]} frustumCulled={false}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        ref={materialRef}
        map={texture}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
        depthWrite={false}
        depthTest={false}
        alphaTest={0.02}
        opacity={initialOpacity}
      />
    </mesh>
  );
}

function MascotPuppet({ action, pointer, analysisActive }) {
  const group = useRef(null);
  const mascotRef = useRef(null);
  const analysisRef = useRef(null);
  const mascotMaterialRef = useRef(null);
  const analysisMaterialRef = useRef(null);
  const pointerTarget = useRef({ x: 0, y: 0 }).current;
  const analysisOpacity = useRef(0);

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

    analysisOpacity.current = THREE.MathUtils.lerp(analysisOpacity.current, motion.analysisPoseOpacity, 0.18);
    const poseOpacity = analysisOpacity.current;

    if (mascotRef.current) {
      mascotRef.current.position.y = Math.sin(t * 2.1) * 0.012;
    }
    if (analysisRef.current) {
      analysisRef.current.visible = poseOpacity > 0.02;
      analysisRef.current.position.y = Math.sin(t * 3.2) * 0.014;
      analysisRef.current.rotation.z = Math.sin(t * 2.6) * 0.012;
    }
    if (mascotMaterialRef.current) {
      mascotMaterialRef.current.opacity = 1 - poseOpacity;
    }
    if (analysisMaterialRef.current) {
      analysisMaterialRef.current.opacity = poseOpacity;
    }
  });

  return (
    <group ref={group}>
      <MascotImage meshRef={mascotRef} materialRef={mascotMaterialRef} />
      <MascotImage
        meshRef={analysisRef}
        materialRef={analysisMaterialRef}
        source="/ai-mascot-analysis-laptop.png"
        width={MASCOT_ANALYSIS_STAGE_WIDTH}
        height={MASCOT_STAGE_HEIGHT}
        z={0.02}
        initialOpacity={0}
      />
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
