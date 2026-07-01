/*
 更新时间: 2026-07-01 12:22:42 CST
 更新内容: 默认闲置状态下缩小福小客舞台尺寸，动作和分析状态保持原尺寸。
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
const MASCOT_BASE_POSE = {
  source: '/ai-mascot-transparent.png',
  width: MASCOT_IMAGE_WIDTH,
  height: MASCOT_IMAGE_HEIGHT,
};
const MASCOT_ACTION_POSES = {
  kpiGuide: {
    source: '/assets/mascot/ceo-mascot-kpi-guide.png',
    width: 1082,
    height: 1454,
  },
  reportPresenter: {
    source: '/assets/mascot/ceo-mascot-report-presenter.png',
    width: 1071,
    height: 1469,
  },
  riskAlert: {
    source: '/assets/mascot/ceo-mascot-risk-alert.png',
    width: 1060,
    height: 1484,
  },
  targetAchieved: {
    source: '/assets/mascot/ceo-mascot-target-achieved.png',
    width: 1072,
    height: 1467,
  },
};

function getMascotPoseStageWidth(pose) {
  return MASCOT_STAGE_HEIGHT * (pose.width / pose.height);
}

function getMascotPoseKey(action = MASCOT_ACTIONS.idle, analysisActive = false) {
  if (action === MASCOT_ACTIONS.alert) return 'riskAlert';
  if (action === MASCOT_ACTIONS.celebrate) return 'targetAchieved';
  if (action === MASCOT_ACTIONS.wave) return 'kpiGuide';
  if (analysisActive || action === MASCOT_ACTIONS.think || action === MASCOT_ACTIONS.talk || action === MASCOT_ACTIONS.click) return 'reportPresenter';
  return '';
}

function getMascotImageStackTransform(pointer = DEFAULT_POINTER, activePoseKey = '') {
  const pointerX = pointer.active ? pointer.x : 0;
  const pointerY = pointer.active ? pointer.y : 0;
  const poseLift = activePoseKey === 'reportPresenter' ? -7 : activePoseKey === 'targetAchieved' ? -9 : 0;

  return `translate3d(${pointerX * 8}px, ${pointerY * -5 + poseLift}px, 0) rotate(${pointerX * -5}deg)`;
}

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
    actionPoseOpacity: getMascotPoseKey(action, analysisActive) ? 1 : 0,
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

function MascotImageStack({ action, pointer, analysisActive }) {
  const activePoseKey = getMascotPoseKey(action, analysisActive);
  const activeImageKey = activePoseKey || 'idle';
  const imagePoses = {
    idle: MASCOT_BASE_POSE,
    ...MASCOT_ACTION_POSES,
  };

  return (
    <span
      className={`mascot-image-stack mascot-image-stack--${activeImageKey}`}
      style={{ transform: getMascotImageStackTransform(pointer, activePoseKey) }}
      aria-hidden="true"
    >
      <span className="mascot-image-stack__motion">
        {Object.entries(imagePoses).map(([poseKey, pose]) => {
          const active = poseKey === activeImageKey;

          return (
            <img
              className={`mascot-pose-image${active ? ' is-active' : ''}`}
              src={pose.source}
              alt=""
              draggable="false"
              aria-hidden="true"
              key={poseKey}
            />
          );
        })}
      </span>
    </span>
  );
}

function MascotPuppet({ action, pointer, analysisActive }) {
  const group = useRef(null);
  const mascotRef = useRef(null);
  const mascotMaterialRef = useRef(null);
  const actionPoseRefs = useRef({});
  const actionPoseMaterialRefs = useRef({});
  const pointerTarget = useRef({ x: 0, y: 0 }).current;
  const actionPoseOpacity = useRef(0);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    const motion = getDesktopPetMotion(action, t, pointer, analysisActive);
    const selectedPoseKey = getMascotPoseKey(action, analysisActive);

    pointerTarget.x = THREE.MathUtils.lerp(pointerTarget.x, motion.x, 0.12);
    pointerTarget.y = THREE.MathUtils.lerp(pointerTarget.y, motion.y, 0.12);
    group.current.position.x = pointerTarget.x;
    group.current.position.y = pointerTarget.y;
    group.current.rotation.z = motion.tilt;
    group.current.scale.set(motion.scale, motion.scale, 1);

    actionPoseOpacity.current = THREE.MathUtils.lerp(actionPoseOpacity.current, motion.actionPoseOpacity, 0.18);
    const poseOpacity = actionPoseOpacity.current;

    if (mascotRef.current) {
      mascotRef.current.position.y = Math.sin(t * 2.1) * 0.012;
    }
    if (mascotMaterialRef.current) {
      mascotMaterialRef.current.opacity = 1 - poseOpacity;
    }
    Object.entries(MASCOT_ACTION_POSES).forEach(([poseKey]) => {
      const mesh = actionPoseRefs.current[poseKey];
      const material = actionPoseMaterialRefs.current[poseKey];
      if (mesh) {
        mesh.visible = poseKey === selectedPoseKey && poseOpacity > 0.02;
        mesh.position.y = Math.sin(t * 3.2) * 0.014;
        mesh.rotation.z = Math.sin(t * 2.6) * 0.012;
      }
      if (material) {
        material.opacity = poseKey === selectedPoseKey ? poseOpacity : 0;
      }
    });
  });

  return (
    <group ref={group}>
      <MascotImage meshRef={mascotRef} materialRef={mascotMaterialRef} />
      {Object.entries(MASCOT_ACTION_POSES).map(([poseKey, pose]) => (
        <MascotImage
          key={poseKey}
          meshRef={(node) => {
            actionPoseRefs.current[poseKey] = node;
          }}
          materialRef={(node) => {
            actionPoseMaterialRefs.current[poseKey] = node;
          }}
          source={pose.source}
          width={getMascotPoseStageWidth(pose)}
          height={MASCOT_STAGE_HEIGHT}
          z={0.02}
          initialOpacity={0}
        />
      ))}
    </group>
  );
}

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  const defaultIdle = action === MASCOT_ACTIONS.idle && !analysisActive;

  return (
    <span className={`mascot-3d-stage${defaultIdle ? ' mascot-3d-stage--default' : ''}`} role="img" aria-label={label}>
      <Canvas
        orthographic
        camera={{ position: [0, 0, 5], zoom: 64 }}
        dpr={[1, 1.7]}
        gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      >
        <MascotPuppet action={action} pointer={pointer} analysisActive={analysisActive} />
      </Canvas>
      <MascotImageStack action={action} pointer={pointer} analysisActive={analysisActive} />
    </span>
  );
}
