/*
 更新时间: 2026-07-01 10:26:08
 更新内容: 福小客骨骼姿态取消 360 旋转，保留固定朝向下的跳跃、说话、思考和提醒动作。
*/
import { MASCOT_ACTIONS } from './mascotCompanion.js';

export const MASCOT_BONES = [
  'root',
  'spine',
  'neck',
  'head',
  'leftShoulder',
  'leftUpperArm',
  'leftForearm',
  'leftHand',
  'rightShoulder',
  'rightUpperArm',
  'rightForearm',
  'rightHand',
  'leftHip',
  'leftUpperLeg',
  'leftLowerLeg',
  'leftFoot',
  'rightHip',
  'rightUpperLeg',
  'rightLowerLeg',
  'rightFoot',
];

const BONE_BASE_POSITIONS = {
  root: [0, -0.48, 0],
  spine: [0, 0.44, 0],
  neck: [0, 0.5, 0],
  head: [0, 0.18, 0],
  leftShoulder: [-0.39, 0.28, 0],
  leftUpperArm: [0, 0, 0],
  leftForearm: [0, -0.42, 0],
  leftHand: [0, -0.34, 0],
  rightShoulder: [0.39, 0.28, 0],
  rightUpperArm: [0, 0, 0],
  rightForearm: [0, -0.42, 0],
  rightHand: [0, -0.34, 0],
  leftHip: [-0.19, -0.42, 0],
  leftUpperLeg: [0, 0, 0],
  leftLowerLeg: [0, -0.46, 0],
  leftFoot: [0, -0.42, 0.04],
  rightHip: [0.19, -0.42, 0],
  rightUpperLeg: [0, 0, 0],
  rightLowerLeg: [0, -0.46, 0],
  rightFoot: [0, -0.42, 0.04],
};

function bone(rotation = [0, 0, 0], position = [0, 0, 0]) {
  return { rotation, position };
}

function basePose() {
  return Object.fromEntries(MASCOT_BONES.map((name) => [name, bone([0, 0, 0], BONE_BASE_POSITIONS[name])]));
}

export function getMascotRigPose(action = MASCOT_ACTIONS.idle, time = 0) {
  const t = Number(time) || 0;
  const wave = Math.sin(t * 4.2);
  const slow = Math.sin(t * 1.6);
  const pose = basePose();

  pose.root = bone(
    [0, 0, 0],
    [0, -0.48 + Math.sin(t * 1.35) * 0.035, 0],
  );
  pose.spine = bone([0.02 * slow, 0, Math.sin(t * 1.2) * 0.04]);
  pose.neck = bone([-0.02 * slow, 0, 0]);
  pose.head = bone([Math.sin(t * 1.8) * 0.05, Math.sin(t * 1.1) * 0.08, Math.sin(t * 1.4) * 0.035]);

  pose.leftShoulder = bone([0, 0, -0.08]);
  pose.rightShoulder = bone([0, 0, 0.08]);
  pose.leftUpperArm = bone([0.08 * slow, 0, -0.42 + Math.sin(t * 1.8) * 0.08]);
  pose.rightUpperArm = bone([-0.08 * slow, 0, 0.42 - Math.sin(t * 1.8) * 0.08]);
  pose.leftForearm = bone([0.16 + Math.sin(t * 2.1) * 0.08, 0, -0.06]);
  pose.rightForearm = bone([0.16 - Math.sin(t * 2.1) * 0.08, 0, 0.06]);
  pose.leftHand = bone([0, 0, Math.sin(t * 2.8) * 0.1]);
  pose.rightHand = bone([0, 0, -Math.sin(t * 2.8) * 0.1]);

  pose.leftHip = bone([0, 0, -0.04]);
  pose.rightHip = bone([0, 0, 0.04]);
  pose.leftUpperLeg = bone([0.08 * slow, 0, -0.06]);
  pose.rightUpperLeg = bone([-0.08 * slow, 0, 0.06]);
  pose.leftLowerLeg = bone([0.08 - Math.sin(t * 1.7) * 0.04, 0, 0]);
  pose.rightLowerLeg = bone([0.08 + Math.sin(t * 1.7) * 0.04, 0, 0]);
  pose.leftFoot = bone([0.02, 0, -0.04]);
  pose.rightFoot = bone([0.02, 0, 0.04]);

  if (action === MASCOT_ACTIONS.wave) {
    pose.rightUpperArm = bone([-0.18, 0, 1.38 + wave * 0.12]);
    pose.rightForearm = bone([-0.72 + wave * 0.22, 0, 0.18]);
    pose.rightHand = bone([0, 0, wave * 0.48]);
    pose.head = bone([-0.03, Math.sin(t * 2.2) * 0.12, -0.04]);
  }

  if (action === MASCOT_ACTIONS.talk) {
    pose.spine = bone([0.02 * slow, 0.04 * slow, 0.09 * wave]);
    pose.head = bone([0.1 * wave, 0.12 * slow, 0.05 * wave]);
    pose.leftUpperArm = bone([0.1 * wave, 0, -0.58 + 0.16 * wave]);
    pose.rightUpperArm = bone([-0.1 * wave, 0, 0.58 + 0.16 * wave]);
    pose.leftForearm = bone([0.3 + 0.22 * wave, 0, -0.18]);
    pose.rightForearm = bone([0.3 - 0.22 * wave, 0, 0.18]);
    pose.leftUpperLeg = bone([0.1 * wave, 0, -0.05]);
    pose.rightUpperLeg = bone([-0.12 * wave, 0, 0.05]);
  }

  if (action === MASCOT_ACTIONS.think) {
    pose.spine = bone([0.08, -0.12, -0.1]);
    pose.head = bone([0.12, -0.22, -0.08]);
    pose.rightUpperArm = bone([-0.25, 0, 0.86]);
    pose.rightForearm = bone([-1.02, 0.12, 0.32]);
    pose.rightHand = bone([-0.08, 0, 0.18]);
    pose.leftUpperArm = bone([0.02, 0, -0.32]);
    pose.leftForearm = bone([0.16, 0, -0.08]);
  }

  if (action === MASCOT_ACTIONS.alert) {
    pose.root = bone([-0.03 * wave, 0, 0.02 * wave], [0, -0.48 + Math.abs(wave) * 0.028, 0]);
    pose.spine = bone([-0.18, 0, 0.12 * wave]);
    pose.head = bone([-0.16, 0.08 * wave, 0.08 * wave]);
    pose.leftUpperArm = bone([-0.08, 0, -0.82 - Math.abs(wave) * 0.18]);
    pose.rightUpperArm = bone([-0.08, 0, 0.82 + Math.abs(wave) * 0.18]);
    pose.leftForearm = bone([0.24, 0, -0.32]);
    pose.rightForearm = bone([0.24, 0, 0.32]);
  }

  if (action === MASCOT_ACTIONS.celebrate || action === MASCOT_ACTIONS.click) {
    const bounce = Math.abs(wave);
    pose.root = bone([0, 0, 0], [0, -0.43 + bounce * 0.08, 0]);
    pose.spine = bone([0.04 * wave, 0, 0.1 * wave]);
    pose.head = bone([-0.08 + 0.08 * wave, 0.1 * slow, 0.08 * wave]);
    pose.leftUpperArm = bone([-0.24, 0, -1.42 - 0.12 * bounce]);
    pose.rightUpperArm = bone([-0.24, 0, 1.42 + 0.12 * bounce]);
    pose.leftForearm = bone([-0.46 - 0.18 * wave, 0, -0.22]);
    pose.rightForearm = bone([-0.46 + 0.18 * wave, 0, 0.22]);
    pose.leftHand = bone([0, 0, -0.28 * wave]);
    pose.rightHand = bone([0, 0, 0.28 * wave]);
    pose.leftUpperLeg = bone([-0.08 * wave, 0, -0.12]);
    pose.rightUpperLeg = bone([0.08 * wave, 0, 0.12]);
    pose.leftLowerLeg = bone([0.22 + 0.08 * bounce, 0, 0]);
    pose.rightLowerLeg = bone([0.22 + 0.08 * bounce, 0, 0]);
  }

  return pose;
}
