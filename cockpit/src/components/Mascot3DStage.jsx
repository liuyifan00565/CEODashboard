/*
 更新时间: 2026-07-06 00:22:00 CST
 更新内容: 增加 Canvas 成功前的 DOM 兜底层和 WebGL context 失败监听，避免 R3F 异步初始化失败时舞台空白。
*/
/*
 更新时间: 2026-07-03 18:48:43 CST
 更新内容: 将福小客主渲染替换为 R3F 程序化骨骼 3D 模型，并保留透明 PNG 作为 WebGL 失败兜底。
*/
import { Component, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import { getMascotRigPose } from '../lib/mascotRig';
import './Mascot3DStage.css';

const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const FALLBACK_MASCOT_SOURCE = '/ai-mascot-transparent.png';
const INITIAL_RIG_POSE = getMascotRigPose(MASCOT_ACTIONS.idle, 0);
const COLORS = {
  suitWhite: '#f8f7ff',
  suitShadow: '#dce8ff',
  faceWhite: '#ffffff',
  helmetPurple: '#724dff',
  helmetBlue: '#397cff',
  iceCyan: '#8be9ff',
  visorBlue: '#66d9ff',
  lineGlow: '#a7f3ff',
  badgePurple: '#4b2ad8',
  darkInk: '#18244d',
  blush: '#ff8fc7',
};

function canCreateWebGLContext() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return true;
  if (!window.WebGLRenderingContext) return false;

  try {
    const canvas = document.createElement('canvas');
    const context = (
      canvas.getContext('webgl2')
      || canvas.getContext('webgl')
      || canvas.getContext('experimental-webgl')
    );
    context?.getExtension?.('WEBGL_lose_context')?.loseContext?.();
    return Boolean(context);
  } catch {
    return false;
  }
}

class MascotCanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure?.();
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

function initialPosition(boneName) {
  return INITIAL_RIG_POSE[boneName]?.position ?? [0, 0, 0];
}

function initialRotation(boneName) {
  return INITIAL_RIG_POSE[boneName]?.rotation ?? [0, 0, 0];
}

function applyBonePose(nodeRef, bone) {
  if (!nodeRef.current || !bone) return;

  const [rotationX = 0, rotationY = 0, rotationZ = 0] = bone.rotation ?? [0, 0, 0];
  const [positionX = 0, positionY = 0, positionZ = 0] = bone.position ?? [0, 0, 0];

  nodeRef.current.rotation.set(rotationX, rotationY, rotationZ);
  nodeRef.current.position.set(positionX, positionY, positionZ);
}

function applyMascotRigPose(partRefs, rigPose) {
  applyBonePose(partRefs.root, rigPose.root);
  applyBonePose(partRefs.spine, rigPose.spine);
  applyBonePose(partRefs.neck, rigPose.neck);
  applyBonePose(partRefs.head, rigPose.head);
  applyBonePose(partRefs.leftShoulder, rigPose.leftShoulder);
  applyBonePose(partRefs.leftUpperArm, rigPose.leftUpperArm);
  applyBonePose(partRefs.leftForearm, rigPose.leftForearm);
  applyBonePose(partRefs.leftHand, rigPose.leftHand);
  applyBonePose(partRefs.rightShoulder, rigPose.rightShoulder);
  applyBonePose(partRefs.rightUpperArm, rigPose.rightUpperArm);
  applyBonePose(partRefs.rightForearm, rigPose.rightForearm);
  applyBonePose(partRefs.rightHand, rigPose.rightHand);
  applyBonePose(partRefs.leftHip, rigPose.leftHip);
  applyBonePose(partRefs.leftUpperLeg, rigPose.leftUpperLeg);
  applyBonePose(partRefs.leftLowerLeg, rigPose.leftLowerLeg);
  applyBonePose(partRefs.leftFoot, rigPose.leftFoot);
  applyBonePose(partRefs.rightHip, rigPose.rightHip);
  applyBonePose(partRefs.rightUpperLeg, rigPose.rightUpperLeg);
  applyBonePose(partRefs.rightLowerLeg, rigPose.rightLowerLeg);
  applyBonePose(partRefs.rightFoot, rigPose.rightFoot);
}

function useMascotPartRefs() {
  return {
    root: useRef(null),
    spine: useRef(null),
    neck: useRef(null),
    head: useRef(null),
    leftShoulder: useRef(null),
    leftUpperArm: useRef(null),
    leftForearm: useRef(null),
    leftHand: useRef(null),
    rightShoulder: useRef(null),
    rightUpperArm: useRef(null),
    rightForearm: useRef(null),
    rightHand: useRef(null),
    leftHip: useRef(null),
    leftUpperLeg: useRef(null),
    leftLowerLeg: useRef(null),
    leftFoot: useRef(null),
    rightHip: useRef(null),
    rightUpperLeg: useRef(null),
    rightLowerLeg: useRef(null),
    rightFoot: useRef(null),
  };
}

function useMascotExpressionRefs() {
  return {
    leftEye: useRef(null),
    rightEye: useRef(null),
    mouth: useRef(null),
    chestBadge: useRef(null),
    leftSuitLight: useRef(null),
    rightSuitLight: useRef(null),
    helmetGlow: useRef(null),
    microphoneGlow: useRef(null),
  };
}

function getDesktopPetMotion(action = MASCOT_ACTIONS.idle, t = 0, pointer = DEFAULT_POINTER, analysisActive = false) {
  const pointerX = pointer.active ? pointer.x : Math.sin(t * 0.72) * 0.18;
  const pointerY = pointer.active ? pointer.y : Math.cos(t * 0.64) * 0.12;
  const idleFloat = Math.sin(t * 1.25) * 0.035;
  const bounce = Math.abs(Math.sin(t * 4.6));
  const isAnalyzing = analysisActive || action === MASCOT_ACTIONS.think || action === MASCOT_ACTIONS.talk || action === MASCOT_ACTIONS.click;
  const flyLift = isAnalyzing ? 0.16 + Math.abs(Math.sin(t * 2.4)) * 0.045 : 0;

  const motion = {
    x: pointerX * 0.1,
    y: idleFloat - pointerY * 0.055 + flyLift,
    tilt: pointerX * -0.12 + Math.sin(t * 1.1) * 0.018,
    scale: 1,
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

function getMascotExpression(action = MASCOT_ACTIONS.idle, t = 0, analysisActive = false) {
  const talkActive = analysisActive || action === MASCOT_ACTIONS.talk;
  const alertActive = action === MASCOT_ACTIONS.alert;
  const celebrateActive = action === MASCOT_ACTIONS.celebrate || action === MASCOT_ACTIONS.click;
  const blink = Math.sin(t * 3.1) > 0.965 ? 0.1 : 1;
  const mouth = talkActive ? 0.06 + Math.abs(Math.sin(t * 10.5)) * 0.11 : 0.055 + Math.max(0, Math.sin(t * 1.7)) * 0.015;
  const glow = (analysisActive ? 0.85 : 0.42) + (alertActive ? 0.55 : 0) + (celebrateActive ? Math.abs(Math.sin(t * 5.4)) * 0.55 : 0);

  return {
    blink,
    mouth,
    glow,
    helmetGlow: 0.3 + glow * 0.5,
    lightPulse: 0.85 + Math.sin(t * (alertActive ? 9.2 : 3.4)) * 0.14,
  };
}

function applyMascotExpression(expressionRefs, expression) {
  const eyeScaleY = Math.max(0.08, expression.blink);

  if (expressionRefs.leftEye.current) expressionRefs.leftEye.current.scale.y = eyeScaleY;
  if (expressionRefs.rightEye.current) expressionRefs.rightEye.current.scale.y = eyeScaleY;
  if (expressionRefs.mouth.current) expressionRefs.mouth.current.scale.set(expression.mouth, 1, 1);
  if (expressionRefs.chestBadge.current) expressionRefs.chestBadge.current.material.emissiveIntensity = expression.glow;
  if (expressionRefs.helmetGlow.current) expressionRefs.helmetGlow.current.material.emissiveIntensity = expression.helmetGlow;
  if (expressionRefs.microphoneGlow.current) expressionRefs.microphoneGlow.current.material.emissiveIntensity = expression.glow + 0.35;
  if (expressionRefs.leftSuitLight.current) expressionRefs.leftSuitLight.current.scale.setScalar(expression.lightPulse);
  if (expressionRefs.rightSuitLight.current) expressionRefs.rightSuitLight.current.scale.setScalar(expression.lightPulse);
}

function LimbCapsule({ name, color = COLORS.suitWhite, length = 0.34, radius = 0.075, position = [0, -0.17, 0] }) {
  return (
    <mesh name={name} position={position} castShadow={false} receiveShadow={false}>
      <capsuleGeometry args={[radius, length, 8, 20]} />
      <meshStandardMaterial color={color} roughness={0.36} metalness={0.08} />
    </mesh>
  );
}

function SuitLine({ name, position, rotation = [0, 0, 0], scale = [1, 1, 1] }) {
  return (
    <mesh name={name} position={position} rotation={rotation} scale={scale}>
      <cylinderGeometry args={[0.012, 0.012, 0.42, 12]} />
      <meshStandardMaterial color={COLORS.lineGlow} emissive={COLORS.iceCyan} emissiveIntensity={0.62} roughness={0.22} />
    </mesh>
  );
}

function MascotHead({ partRefs, expressionRefs }) {
  return (
    <group ref={partRefs.head} position={initialPosition('head')} rotation={initialRotation('head')} name="head-rig">
      <mesh name="round-head-face" position={[0, 0, 0.03]} scale={[1, 1.03, 0.95]}>
        <sphereGeometry args={[0.32, 36, 24]} />
        <meshStandardMaterial color={COLORS.faceWhite} roughness={0.3} metalness={0.04} />
      </mesh>
      <mesh name="purple-blue-helmet-shell" position={[0, 0.08, -0.035]} scale={[1.13, 0.82, 0.96]}>
        <sphereGeometry args={[0.35, 36, 18, 0, Math.PI * 2, 0, Math.PI * 0.72]} />
        <meshStandardMaterial color={COLORS.helmetPurple} emissive={COLORS.helmetBlue} emissiveIntensity={0.18} roughness={0.27} metalness={0.16} />
      </mesh>
      <mesh ref={expressionRefs.helmetGlow} name="helmet-cyan-visor-glow" position={[0, 0.11, 0.3]} scale={[1.16, 0.22, 0.08]}>
        <torusGeometry args={[0.22, 0.017, 10, 48, Math.PI]} />
        <meshStandardMaterial color={COLORS.visorBlue} emissive={COLORS.iceCyan} emissiveIntensity={0.5} roughness={0.18} />
      </mesh>
      <mesh ref={expressionRefs.leftEye} name="left-eye-light" position={[-0.1, -0.015, 0.315]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[0.036, 16, 10]} />
        <meshStandardMaterial color={COLORS.darkInk} emissive={COLORS.iceCyan} emissiveIntensity={0.16} roughness={0.24} />
      </mesh>
      <mesh ref={expressionRefs.rightEye} name="right-eye-light" position={[0.1, -0.015, 0.315]} scale={[1, 1, 0.5]}>
        <sphereGeometry args={[0.036, 16, 10]} />
        <meshStandardMaterial color={COLORS.darkInk} emissive={COLORS.iceCyan} emissiveIntensity={0.16} roughness={0.24} />
      </mesh>
      <mesh ref={expressionRefs.mouth} name="talk-mouth" position={[0, -0.12, 0.32]} scale={[0.06, 1, 1]}>
        <boxGeometry args={[1, 0.018, 0.012]} />
        <meshStandardMaterial color={COLORS.helmetPurple} emissive={COLORS.helmetPurple} emissiveIntensity={0.18} roughness={0.3} />
      </mesh>
      <mesh name="left-blush-signal" position={[-0.18, -0.08, 0.3]} scale={[1.35, 0.7, 0.28]}>
        <sphereGeometry args={[0.028, 14, 8]} />
        <meshStandardMaterial color={COLORS.blush} emissive={COLORS.blush} emissiveIntensity={0.22} roughness={0.42} transparent opacity={0.74} />
      </mesh>
      <mesh name="right-blush-signal" position={[0.18, -0.08, 0.3]} scale={[1.35, 0.7, 0.28]}>
        <sphereGeometry args={[0.028, 14, 8]} />
        <meshStandardMaterial color={COLORS.blush} emissive={COLORS.blush} emissiveIntensity={0.22} roughness={0.42} transparent opacity={0.74} />
      </mesh>
      <mesh name="headset-band" position={[0, 0.14, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.018, 10, 54, Math.PI]} />
        <meshStandardMaterial color={COLORS.helmetBlue} emissive={COLORS.helmetPurple} emissiveIntensity={0.2} roughness={0.25} metalness={0.16} />
      </mesh>
      <mesh name="left-earphone-earcup" position={[-0.35, 0.005, 0.035]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.105, 0.13, 0.09, 24]} />
        <meshStandardMaterial color={COLORS.helmetPurple} emissive={COLORS.helmetBlue} emissiveIntensity={0.25} roughness={0.24} metalness={0.2} />
      </mesh>
      <mesh name="right-earphone-earcup" position={[0.35, 0.005, 0.035]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.13, 0.105, 0.09, 24]} />
        <meshStandardMaterial color={COLORS.helmetPurple} emissive={COLORS.helmetBlue} emissiveIntensity={0.25} roughness={0.24} metalness={0.2} />
      </mesh>
      <mesh name="microphone-boom" position={[0.33, -0.14, 0.22]} rotation={[0.45, 0.08, -0.72]}>
        <capsuleGeometry args={[0.014, 0.28, 5, 12]} />
        <meshStandardMaterial color={COLORS.darkInk} emissive={COLORS.helmetBlue} emissiveIntensity={0.24} roughness={0.3} />
      </mesh>
      <mesh ref={expressionRefs.microphoneGlow} name="microphone-glow-tip" position={[0.2, -0.22, 0.31]}>
        <sphereGeometry args={[0.026, 16, 10]} />
        <meshStandardMaterial color={COLORS.iceCyan} emissive={COLORS.iceCyan} emissiveIntensity={0.9} roughness={0.18} />
      </mesh>
    </group>
  );
}

function MascotBody({ expressionRefs }) {
  return (
    <>
      <mesh name="white-body-suit-torso" position={[0, -0.07, 0.01]} scale={[1, 1.12, 0.72]}>
        <capsuleGeometry args={[0.29, 0.54, 10, 28]} />
        <meshStandardMaterial color={COLORS.suitWhite} emissive={COLORS.suitShadow} emissiveIntensity={0.1} roughness={0.32} metalness={0.08} />
      </mesh>
      <mesh name="blue-belt-core" position={[0, -0.38, 0.16]} scale={[1.08, 0.22, 0.36]}>
        <torusGeometry args={[0.25, 0.025, 10, 42]} />
        <meshStandardMaterial color={COLORS.helmetBlue} emissive={COLORS.helmetPurple} emissiveIntensity={0.24} roughness={0.25} metalness={0.18} />
      </mesh>
      <mesh ref={expressionRefs.chestBadge} name="chest-AI-badge-emblem" position={[0, 0.03, 0.285]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.028, 32]} />
        <meshStandardMaterial color={COLORS.badgePurple} emissive={COLORS.helmetPurple} emissiveIntensity={0.58} roughness={0.2} metalness={0.12} />
      </mesh>
      <Text
        name="AI-badge-text"
        position={[0, 0.025, 0.305]}
        fontSize={0.1}
        color={COLORS.faceWhite}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.004}
        outlineColor={COLORS.iceCyan}
      >
        AI
      </Text>
      <group ref={expressionRefs.leftSuitLight}>
        <SuitLine name="left-suit-line-signal" position={[-0.12, 0.03, 0.29]} rotation={[0, 0, -0.22]} />
      </group>
      <group ref={expressionRefs.rightSuitLight}>
        <SuitLine name="right-suit-line-signal" position={[0.12, 0.03, 0.29]} rotation={[0, 0, 0.22]} />
      </group>
      <mesh name="front-suit-glow-dot" position={[0, -0.2, 0.31]}>
        <sphereGeometry args={[0.022, 14, 8]} />
        <meshStandardMaterial color={COLORS.lineGlow} emissive={COLORS.iceCyan} emissiveIntensity={0.72} roughness={0.2} />
      </mesh>
    </>
  );
}

function MascotArm({ side, partRefs }) {
  const isLeft = side === 'left';
  const direction = isLeft ? -1 : 1;
  const shoulderRef = isLeft ? partRefs.leftShoulder : partRefs.rightShoulder;
  const upperArmRef = isLeft ? partRefs.leftUpperArm : partRefs.rightUpperArm;
  const forearmRef = isLeft ? partRefs.leftForearm : partRefs.rightForearm;
  const handRef = isLeft ? partRefs.leftHand : partRefs.rightHand;
  const shoulderBone = isLeft ? 'leftShoulder' : 'rightShoulder';
  const upperArmBone = isLeft ? 'leftUpperArm' : 'rightUpperArm';
  const forearmBone = isLeft ? 'leftForearm' : 'rightForearm';
  const handBone = isLeft ? 'leftHand' : 'rightHand';

  return (
    <group ref={shoulderRef} position={initialPosition(shoulderBone)} rotation={initialRotation(shoulderBone)} name={`${side}-shoulder-rig`}>
      <mesh name={`${side}-purple-shoulder-joint`} position={[0, 0, 0]}>
        <sphereGeometry args={[0.085, 18, 12]} />
        <meshStandardMaterial color={COLORS.helmetPurple} emissive={COLORS.helmetBlue} emissiveIntensity={0.18} roughness={0.28} />
      </mesh>
      <group ref={upperArmRef} position={initialPosition(upperArmBone)} rotation={initialRotation(upperArmBone)} name={`${side}-upperArm-rig`}>
        <LimbCapsule name={`${side}-upper-arm-white-suit`} position={[0, -0.2, 0.01]} length={0.32} radius={0.065} />
        <group ref={forearmRef} position={initialPosition(forearmBone)} rotation={initialRotation(forearmBone)} name={`${side}-forearm-rig`}>
          <LimbCapsule name={`${side}-forearm-blue-trim`} color={COLORS.suitShadow} position={[0, -0.16, 0.015]} length={0.28} radius={0.06} />
          <mesh name={`${side}-wrist-ring`} position={[0, -0.31, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.063, 0.01, 8, 24]} />
            <meshStandardMaterial color={COLORS.iceCyan} emissive={COLORS.iceCyan} emissiveIntensity={0.36} roughness={0.2} />
          </mesh>
          <group ref={handRef} position={initialPosition(handBone)} rotation={initialRotation(handBone)} name={`${side}-hand-rig`}>
            <mesh name={`${side}-hand-round-mitt`} position={[0.01 * direction, -0.015, 0.03]} scale={[1.12, 0.88, 0.8]}>
              <sphereGeometry args={[0.08, 18, 12]} />
              <meshStandardMaterial color={COLORS.faceWhite} emissive={COLORS.suitShadow} emissiveIntensity={0.08} roughness={0.32} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function MascotLeg({ side, partRefs }) {
  const isLeft = side === 'left';
  const hipRef = isLeft ? partRefs.leftHip : partRefs.rightHip;
  const upperLegRef = isLeft ? partRefs.leftUpperLeg : partRefs.rightUpperLeg;
  const lowerLegRef = isLeft ? partRefs.leftLowerLeg : partRefs.rightLowerLeg;
  const footRef = isLeft ? partRefs.leftFoot : partRefs.rightFoot;
  const hipBone = isLeft ? 'leftHip' : 'rightHip';
  const upperLegBone = isLeft ? 'leftUpperLeg' : 'rightUpperLeg';
  const lowerLegBone = isLeft ? 'leftLowerLeg' : 'rightLowerLeg';
  const footBone = isLeft ? 'leftFoot' : 'rightFoot';

  return (
    <group ref={hipRef} position={initialPosition(hipBone)} rotation={initialRotation(hipBone)} name={`${side}-hip-rig`}>
      <group ref={upperLegRef} position={initialPosition(upperLegBone)} rotation={initialRotation(upperLegBone)} name={`${side}-upperLeg-rig`}>
        <LimbCapsule name={`${side}-upper-leg-white-suit`} position={[0, -0.21, 0]} length={0.34} radius={0.07} />
        <group ref={lowerLegRef} position={initialPosition(lowerLegBone)} rotation={initialRotation(lowerLegBone)} name={`${side}-lowerLeg-rig`}>
          <LimbCapsule name={`${side}-lower-leg-blue-shadow`} color={COLORS.suitShadow} position={[0, -0.19, 0.015]} length={0.31} radius={0.065} />
          <group ref={footRef} position={initialPosition(footBone)} rotation={initialRotation(footBone)} name={`${side}-foot-rig`}>
            <mesh name={`${side}-foot-boot`} position={[0, -0.02, 0.08]} scale={[1.5, 0.68, 0.86]}>
              <boxGeometry args={[0.14, 0.095, 0.18]} />
              <meshStandardMaterial color={COLORS.helmetBlue} emissive={COLORS.helmetPurple} emissiveIntensity={0.18} roughness={0.32} metalness={0.1} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

function MascotModel({ partRefs, expressionRefs }) {
  return (
    <group ref={partRefs.root} position={initialPosition('root')} rotation={initialRotation('root')} name="root-rig">
      <group ref={partRefs.spine} position={initialPosition('spine')} rotation={initialRotation('spine')} name="spine-body-rig">
        <MascotBody expressionRefs={expressionRefs} />
        <group ref={partRefs.neck} position={initialPosition('neck')} rotation={initialRotation('neck')} name="neck-rig">
          <MascotHead partRefs={partRefs} expressionRefs={expressionRefs} />
        </group>
        <MascotArm side="left" partRefs={partRefs} />
        <MascotArm side="right" partRefs={partRefs} />
      </group>
      <MascotLeg side="left" partRefs={partRefs} />
      <MascotLeg side="right" partRefs={partRefs} />
    </group>
  );
}

function MascotPuppet({ action, pointer, analysisActive }) {
  const desktopPetRoot = useRef(null);
  const partRefs = useMascotPartRefs();
  const expressionRefs = useMascotExpressionRefs();
  const pointerTarget = useRef({ x: 0, y: 0 }).current;

  useFrame(({ clock }) => {
    if (!desktopPetRoot.current) return;

    const t = clock.getElapsedTime();
    const safePointer = pointer ?? DEFAULT_POINTER;
    const motion = getDesktopPetMotion(action, t, safePointer, analysisActive);
    const rigPose = getMascotRigPose(action, t);
    const expression = getMascotExpression(action, t, analysisActive);

    pointerTarget.x = THREE.MathUtils.lerp(pointerTarget.x, motion.x, 0.12);
    pointerTarget.y = THREE.MathUtils.lerp(pointerTarget.y, motion.y, 0.12);
    desktopPetRoot.current.position.x = pointerTarget.x;
    desktopPetRoot.current.position.y = pointerTarget.y;
    desktopPetRoot.current.rotation.z = motion.tilt;
    desktopPetRoot.current.scale.set(motion.scale, motion.scale, motion.scale);

    applyMascotRigPose(partRefs, rigPose);
    applyMascotExpression(expressionRefs, expression);
  });

  return (
    <group ref={desktopPetRoot}>
      <MascotModel partRefs={partRefs} expressionRefs={expressionRefs} />
    </group>
  );
}

function MascotFallbackImage({ className = 'mascot-fallback-image' }) {
  return (
    <img
      className={className}
      src={FALLBACK_MASCOT_SOURCE}
      alt=""
      draggable="false"
      aria-hidden="true"
    />
  );
}

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  const [canvasFailed, setCanvasFailed] = useState(() => !canCreateWebGLContext());
  const [canvasReady, setCanvasReady] = useState(false);
  const canvasEventCleanupRef = useRef(null);
  const defaultIdle = action === MASCOT_ACTIONS.idle && !analysisActive;
  const showFallback = canvasFailed || !canvasReady;
  const loadingFallback = !canvasFailed && !canvasReady;
  const stageClassName = `mascot-3d-stage${defaultIdle ? ' mascot-3d-stage--default' : ''}${showFallback ? ' mascot-3d-stage--fallback' : ''}${loadingFallback ? ' mascot-3d-stage--loading' : ''}${canvasFailed ? ' mascot-3d-stage--failed' : ''}`;
  const fallbackImage = <MascotFallbackImage className="mascot-fallback-image mascot-fallback-image--canvas" />;

  useEffect(() => () => {
    canvasEventCleanupRef.current?.();
  }, []);

  const handleCanvasFailure = () => {
    canvasEventCleanupRef.current?.();
    canvasEventCleanupRef.current = null;
    setCanvasReady(false);
    setCanvasFailed(true);
  };

  const handleCanvasCreated = ({ gl }) => {
    canvasEventCleanupRef.current?.();
    canvasEventCleanupRef.current = null;

    const canvas = gl?.domElement;
    if (canvas?.addEventListener) {
      const handleContextFailure = (event) => {
        event?.preventDefault?.();
        handleCanvasFailure();
      };

      canvas.addEventListener('webglcontextcreationerror', handleContextFailure, false);
      canvas.addEventListener('webglcontextlost', handleContextFailure, false);
      canvasEventCleanupRef.current = () => {
        canvas.removeEventListener('webglcontextcreationerror', handleContextFailure, false);
        canvas.removeEventListener('webglcontextlost', handleContextFailure, false);
      };
    }

    setCanvasReady(true);
    setCanvasFailed(false);
  };

  return (
    <span className={stageClassName} role="img" aria-label={label}>
      {!canvasFailed && (
        <MascotCanvasErrorBoundary fallback={fallbackImage} onFailure={handleCanvasFailure}>
          <Canvas
            orthographic
            camera={{ position: [0, 0, 5], zoom: 64 }}
            dpr={[1, 1.7]}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
            onCreated={handleCanvasCreated}
            onError={handleCanvasFailure}
            fallback={fallbackImage}
          >
            <ambientLight intensity={1.08} />
            <directionalLight position={[1.8, 2.6, 3.2]} intensity={1.45} color="#ffffff" />
            <pointLight position={[-0.7, 0.6, 1.4]} intensity={0.82} color={COLORS.helmetPurple} />
            <pointLight position={[0.72, -0.28, 1.8]} intensity={0.58} color={COLORS.iceCyan} />
            <MascotPuppet action={action} pointer={pointer} analysisActive={analysisActive} />
          </Canvas>
        </MascotCanvasErrorBoundary>
      )}
      <MascotFallbackImage />
    </span>
  );
}
