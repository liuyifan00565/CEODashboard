/*
 更新时间: 2026-07-01 10:26:08
 更新内容: 福小客骨骼姿态测试移除整圈旋转约束，改为固定朝向下的弹跳和关节动作。
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { MASCOT_ACTIONS } from './mascotCompanion.js';
import { MASCOT_BONES, getMascotRigPose } from './mascotRig.js';

test('defines a full articulated mascot skeleton', () => {
  assert.deepEqual(MASCOT_BONES, [
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
  ]);
});

test('returns a pose object for every skeleton bone', () => {
  const pose = getMascotRigPose(MASCOT_ACTIONS.talk, 1.25, 0);
  for (const bone of MASCOT_BONES) {
    assert.ok(pose[bone], `${bone} pose should exist`);
    assert.equal(typeof pose[bone].rotation[0], 'number');
    assert.equal(typeof pose[bone].rotation[1], 'number');
    assert.equal(typeof pose[bone].rotation[2], 'number');
  }
});

test('talk pose moves head spine arms and legs independently', () => {
  const pose = getMascotRigPose(MASCOT_ACTIONS.talk, 1.25, 0);

  assert.notEqual(pose.head.rotation[0], 0);
  assert.notEqual(pose.spine.rotation[2], 0);
  assert.notEqual(pose.leftUpperArm.rotation[2], pose.rightUpperArm.rotation[2]);
  assert.notEqual(pose.leftForearm.rotation[0], pose.rightForearm.rotation[0]);
  assert.notEqual(pose.leftUpperLeg.rotation[0], pose.rightUpperLeg.rotation[0]);
});

test('celebrate pose raises both arms and bounces without yaw spin', () => {
  const pose = getMascotRigPose(MASCOT_ACTIONS.celebrate, 0.8, 1);

  assert.ok(pose.leftUpperArm.rotation[2] < -1);
  assert.ok(pose.rightUpperArm.rotation[2] > 1);
  assert.ok(pose.leftForearm.rotation[0] < -0.2);
  assert.ok(pose.rightForearm.rotation[0] < -0.2);
  assert.ok(Math.abs(pose.root.rotation[1]) < 0.01);
  assert.ok(pose.root.position[1] > -0.48);
});

test('spin token does not turn the mascot away from its fixed front-facing pose', () => {
  const still = getMascotRigPose(MASCOT_ACTIONS.idle, 1.2, 0);
  const clicked = getMascotRigPose(MASCOT_ACTIONS.idle, 1.2, 4);

  assert.equal(clicked.root.rotation[1], still.root.rotation[1]);
});

test('alert pose leans forward and opens arms for warning', () => {
  const pose = getMascotRigPose(MASCOT_ACTIONS.alert, 0.4, 0);

  assert.ok(pose.spine.rotation[0] < 0);
  assert.ok(pose.leftUpperArm.rotation[2] < -0.4);
  assert.ok(pose.rightUpperArm.rotation[2] > 0.4);
  assert.ok(pose.head.rotation[0] < 0);
});
