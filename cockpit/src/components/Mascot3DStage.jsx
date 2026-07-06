/*
 更新时间: 2026-07-06 12:11:26 CST
 更新内容: 将 AI 小人舞台切换为 Blender 生成 GLB 模型，使用控制节点和 performance 时间驱动动作。
*/
import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { MathUtils } from 'three';

import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const MASCOT_GLB_SOURCE = '/models/ai-mascot.glb';
const FALLBACK_MASCOT_SOURCE = '/ai-mascot-transparent.png';
const VALID_ACTIONS = new Set(Object.values(MASCOT_ACTIONS));
const CONTROL_NAMES = {
  root: 'MascotRoot',
  body: 'BodyCtrl',
  head: 'HeadCtrl',
  leftArm: 'LeftArmCtrl',
  rightArm: 'RightArmCtrl',
  leftLeg: 'LeftLegCtrl',
  rightLeg: 'RightLegCtrl',
};

function clampUnit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return MathUtils.clamp(number, -1, 1);
}

function getSafeAction(action) {
  return VALID_ACTIONS.has(action) ? action : MASCOT_ACTIONS.idle;
}

function getStagePointer(pointer) {
  if (!pointer) return DEFAULT_POINTER;

  return {
    x: pointer.active ? clampUnit(pointer.x) : 0,
    y: pointer.active ? clampUnit(pointer.y) : 0,
    active: Boolean(pointer.active),
  };
}

function snapshotTransform(object) {
  return {
    position: object.position.clone(),
    rotation: object.rotation.clone(),
    scale: object.scale.clone(),
  };
}

function restoreTransform(object, base, position = [0, 0, 0], rotation = [0, 0, 0], scale = 1) {
  if (!object || !base) return;

  object.position.set(
    base.position.x + position[0],
    base.position.y + position[1],
    base.position.z + position[2],
  );
  object.rotation.set(
    base.rotation.x + rotation[0],
    base.rotation.y + rotation[1],
    base.rotation.z + rotation[2],
  );
  object.scale.set(
    base.scale.x * scale,
    base.scale.y * scale,
    base.scale.z * scale,
  );
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
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function MascotGlbModel({ action, pointer, analysisActive, onReady }) {
  const { scene } = useGLTF(MASCOT_GLB_SOURCE);
  const model = useMemo(() => scene.clone(true), [scene]);
  const controlsRef = useRef(null);
  const baseRef = useRef(null);
  const readyRef = useRef(false);
  const startTimeRef = useRef(performance.now() * 0.001);

  useEffect(() => {
    const controls = Object.fromEntries(
      Object.entries(CONTROL_NAMES).map(([key, name]) => [key, model.getObjectByName(name)]),
    );
    const base = Object.fromEntries(
      Object.entries(controls).map(([key, object]) => [key, object ? snapshotTransform(object) : null]),
    );

    model.traverse((object) => {
      object.frustumCulled = false;
    });

    controlsRef.current = controls;
    baseRef.current = base;
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
  }, [model, onReady]);

  useFrame(() => {
    const controls = controlsRef.current;
    const base = baseRef.current;
    if (!controls || !base) return;

    const t = performance.now() * 0.001 - startTimeRef.current;
    const pointerX = pointer.active ? pointer.x : Math.sin(t * 0.6) * 0.12;
    const pointerY = pointer.active ? pointer.y : Math.cos(t * 0.5) * 0.08;
    const idleFloat = Math.sin(t * 1.35) * 0.045;
    const talkPulse = Math.sin(t * 10);
    const bounce = Math.abs(Math.sin(t * 5.2));
    const activeTalk = analysisActive || action === MASCOT_ACTIONS.talk;

    let rootY = idleFloat + pointerY * 0.035;
    let rootRotZ = pointerX * -0.08;
    let headRotZ = pointerX * -0.06 + Math.sin(t * 1.3) * 0.018;
    let bodyRotZ = Math.sin(t * 1.1) * 0.012;
    let leftArmRotZ = Math.sin(t * 1.6) * 0.025;
    let rightArmRotZ = -Math.sin(t * 1.6) * 0.025;
    let leftLegRotZ = 0;
    let rightLegRotZ = 0;
    let rootScale = 1;

    if (action === MASCOT_ACTIONS.wave) {
      rootY += bounce * 0.055;
      headRotZ += Math.sin(t * 4.4) * 0.055;
      rightArmRotZ += -0.38 + Math.sin(t * 8) * 0.26;
    }

    if (activeTalk) {
      rootY += Math.abs(talkPulse) * 0.028;
      headRotZ += Math.sin(t * 8.4) * 0.035;
      bodyRotZ += Math.sin(t * 7.2) * 0.018;
      leftArmRotZ += Math.sin(t * 6.5) * 0.06;
      rightArmRotZ -= Math.sin(t * 6.5) * 0.06;
    }

    if (action === MASCOT_ACTIONS.think) {
      rootRotZ -= 0.045;
      headRotZ -= 0.1;
      rightArmRotZ -= 0.16;
    }

    if (action === MASCOT_ACTIONS.alert) {
      rootY += bounce * 0.08;
      rootRotZ += Math.sin(t * 14) * 0.045;
      headRotZ += Math.sin(t * 12) * 0.08;
      leftArmRotZ += 0.12;
      rightArmRotZ -= 0.12;
    }

    if (action === MASCOT_ACTIONS.celebrate || action === MASCOT_ACTIONS.click) {
      rootY += Math.pow(bounce, 1.4) * 0.16;
      rootRotZ += Math.sin(t * 5.4) * 0.055;
      leftArmRotZ += 0.24 + Math.sin(t * 7) * 0.16;
      rightArmRotZ -= 0.28 + Math.sin(t * 7) * 0.16;
      leftLegRotZ -= Math.sin(t * 7) * 0.035;
      rightLegRotZ += Math.sin(t * 7) * 0.035;
      rootScale = 1 + Math.pow(bounce, 1.2) * 0.025;
    }

    restoreTransform(controls.root, base.root, [pointerX * 0.055, rootY, 0], [0, 0, rootRotZ], rootScale);
    restoreTransform(controls.body, base.body, [0, 0, 0], [0, 0, bodyRotZ], 1);
    restoreTransform(controls.head, base.head, [0, activeTalk ? Math.abs(talkPulse) * 0.018 : 0, 0], [0, 0, headRotZ], 1);
    restoreTransform(controls.leftArm, base.leftArm, [0, 0, 0], [0, 0, leftArmRotZ], 1);
    restoreTransform(controls.rightArm, base.rightArm, [0, 0, 0], [0, 0, rightArmRotZ], 1);
    restoreTransform(controls.leftLeg, base.leftLeg, [0, 0, 0], [0, 0, leftLegRotZ], 1);
    restoreTransform(controls.rightLeg, base.rightLeg, [0, 0, 0], [0, 0, rightLegRotZ], 1);
  });

  return <primitive object={model} position={[0, -1.28, 0]} scale={0.92} />;
}

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  const [modelReady, setModelReady] = useState(false);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const safeAction = getSafeAction(action);
  const stagePointer = getStagePointer(pointer);
  const defaultIdle = safeAction === MASCOT_ACTIONS.idle && !analysisActive;
  const stageClassName = [
    'mascot-3d-stage',
    'mascot-3d-stage--glb',
    `mascot-action--${safeAction}`,
    defaultIdle ? 'mascot-3d-stage--default' : '',
    analysisActive ? 'mascot-3d-stage--active' : '',
    stagePointer.active ? 'mascot-3d-stage--tracking' : '',
    modelReady ? 'mascot-3d-stage--ready' : '',
    canvasFailed ? 'mascot-3d-stage--failed' : '',
  ].filter(Boolean).join(' ');

  return (
    <span className={stageClassName} role="img" aria-label={label} data-action={safeAction}>
      <MascotCanvasErrorBoundary onFailure={() => setCanvasFailed(true)}>
        {!canvasFailed && (
          <Canvas
            orthographic
            camera={{ position: [0, 0, 5], zoom: 52 }}
            dpr={[1, 1.7]}
            gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
            onError={() => setCanvasFailed(true)}
          >
            <ambientLight intensity={1.65} />
            <directionalLight position={[2, 3, 4]} intensity={2.2} color="#ffffff" />
            <pointLight position={[-1.3, 1.2, 2.4]} intensity={1.3} color="#8be9ff" />
            <pointLight position={[1.3, -0.8, 2.2]} intensity={0.9} color="#724dff" />
            <Suspense fallback={null}>
              <MascotGlbModel
                action={safeAction}
                pointer={stagePointer}
                analysisActive={analysisActive}
                onReady={() => setModelReady(true)}
              />
            </Suspense>
          </Canvas>
        )}
      </MascotCanvasErrorBoundary>
      <img
        className="mascot-reference-fallback"
        src={FALLBACK_MASCOT_SOURCE}
        alt=""
        draggable="false"
        aria-hidden="true"
      />
    </span>
  );
}

useGLTF.preload(MASCOT_GLB_SOURCE);
