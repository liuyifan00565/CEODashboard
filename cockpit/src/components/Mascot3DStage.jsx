/*
 更新时间: 2026-07-06 10:33:11 CST
 更新内容: 将鼠标跟随位移拆成带单位 CSS 变量，避免被分层骨骼动画覆盖。
*/
/*
 更新时间: 2026-07-06 10:42:00 CST
 更新内容: 将低保真 Three.js 拼装替换为参考图风格 2.5D SVG 分层骨骼小人，保留动作和鼠标驱动。
*/
/*
 更新时间: 2026-07-06 00:22:00 CST
 更新内容: 增加 Canvas 成功前的 DOM 兜底层和 WebGL context 失败监听，避免 R3F 异步初始化失败时舞台空白。
*/
/*
 更新时间: 2026-07-03 18:48:43 CST
 更新内容: 将福小客主渲染替换为 R3F 程序化骨骼 3D 模型，并保留透明 PNG 作为 WebGL 失败兜底。
*/
import { MASCOT_ACTIONS } from '../lib/mascotCompanion';
import './Mascot3DStage.css';

const DEFAULT_POINTER = { x: 0, y: 0, active: false };
const VALID_ACTIONS = new Set(Object.values(MASCOT_ACTIONS));

function clampUnit(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(-1, Math.min(1, number));
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

export default function Mascot3DStage({
  action = MASCOT_ACTIONS.idle,
  pointer = DEFAULT_POINTER,
  analysisActive = false,
  label = '福小客 3D 经营助手',
}) {
  const safeAction = getSafeAction(action);
  const stagePointer = getStagePointer(pointer);
  const defaultIdle = safeAction === MASCOT_ACTIONS.idle && !analysisActive;
  const stageClassName = [
    'mascot-3d-stage',
    'mascot-3d-stage--layered',
    `mascot-action--${safeAction}`,
    defaultIdle ? 'mascot-3d-stage--default' : '',
    analysisActive ? 'mascot-3d-stage--active' : '',
    stagePointer.active ? 'mascot-3d-stage--tracking' : '',
  ].filter(Boolean).join(' ');
  const stageStyle = {
    '--mascot-pointer-x': stagePointer.x,
    '--mascot-pointer-y': stagePointer.y,
    '--mascot-pointer-translate-x': `${stagePointer.x * 4}px`,
    '--mascot-pointer-translate-y': `${stagePointer.y * -4}px`,
    '--mascot-pointer-root-tilt': `${stagePointer.x * -2}deg`,
    '--mascot-pointer-head-x': `${stagePointer.x * 2.4}px`,
    '--mascot-pointer-head-y': `${stagePointer.y * -1.4}px`,
    '--mascot-pointer-head-tilt': `${stagePointer.x * -3}deg`,
  };

  return (
    <span className={stageClassName} role="img" aria-label={label} data-action={safeAction} style={stageStyle}>
      <svg
        className="mascot-layered-rig"
        viewBox="0 0 240 330"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id="helmetGlassGradient" cx="38%" cy="18%" r="76%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity=".82" />
            <stop offset="18%" stopColor="#cfeaff" stopOpacity=".62" />
            <stop offset="44%" stopColor="#7258ff" stopOpacity=".64" />
            <stop offset="100%" stopColor="#3312d7" stopOpacity=".86" />
          </radialGradient>
          <linearGradient id="helmetShellGradient" x1="18%" y1="0%" x2="80%" y2="96%">
            <stop offset="0%" stopColor="#8be9ff" stopOpacity=".88" />
            <stop offset="18%" stopColor="#7c5cff" />
            <stop offset="58%" stopColor="#542fff" />
            <stop offset="100%" stopColor="#3312d7" />
          </linearGradient>
          <radialGradient id="faceGradient" cx="44%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="58%" stopColor="#fff0fb" />
            <stop offset="100%" stopColor="#e9d4ff" />
          </radialGradient>
          <linearGradient id="suitGradient" x1="18%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="52%" stopColor="#edf4ff" />
            <stop offset="100%" stopColor="#d9e7ff" />
          </linearGradient>
          <linearGradient id="cyanGlowGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#8be9ff" stopOpacity=".1" />
            <stop offset="52%" stopColor="#56dfff" />
            <stop offset="100%" stopColor="#8be9ff" stopOpacity=".1" />
          </linearGradient>
          <radialGradient id="cheekGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff8fc7" stopOpacity=".82" />
            <stop offset="100%" stopColor="#ff8fc7" stopOpacity="0" />
          </radialGradient>
          <filter id="softShadow" x="-24%" y="-16%" width="148%" height="144%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#090b1b" floodOpacity=".36" />
          </filter>
          <filter id="glassGlow" x="-18%" y="-18%" width="136%" height="136%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0.54 0 0 0 0 0.86 0 0 0 0 1 0 0 0 .55 0"
            />
            <feBlend in="SourceGraphic" mode="screen" />
          </filter>
        </defs>

        <g className="mascot-bone mascot-bone--root" filter="url(#softShadow)">
          <ellipse className="mascot-ground-shadow" cx="120" cy="304" rx="55" ry="12" />

          <g className="mascot-bone mascot-bone--left-leg mascot-layer--left-leg">
            <path className="mascot-suit-limb" d="M82 199 C67 225 66 268 78 292 C86 305 113 304 119 289 C124 259 118 224 105 201 Z" />
            <path className="mascot-purple-boot" d="M75 279 C85 291 111 291 121 279 L124 293 C114 307 84 309 72 294 Z" />
            <path className="mascot-cyan-slot" d="M82 242 C91 248 101 249 112 244" />
            <path className="mascot-layer--suit-lines mascot-panel-line" d="M92 211 C88 228 88 247 94 263" />
          </g>

          <g className="mascot-bone mascot-bone--right-leg mascot-layer--right-leg">
            <path className="mascot-suit-limb" d="M137 201 C128 228 129 261 135 289 C141 305 170 306 179 291 C190 264 181 224 160 199 Z" />
            <path className="mascot-purple-boot" d="M133 278 C145 290 171 291 181 279 L184 293 C174 307 142 309 132 294 Z" />
            <path className="mascot-cyan-slot" d="M143 242 C153 248 164 248 174 243" />
            <path className="mascot-layer--suit-lines mascot-panel-line" d="M153 212 C160 232 160 250 154 266" />
          </g>

          <g className="mascot-bone mascot-bone--body mascot-layer--body">
            <path className="mascot-layer--body mascot-suit-body" d="M72 148 C80 124 160 124 168 148 C182 190 170 226 143 238 C130 244 107 244 94 238 C67 226 58 188 72 148 Z" />
            <path className="mascot-purple-yoke" d="M84 143 C103 132 137 132 157 143 C149 158 136 167 120 168 C104 167 92 158 84 143 Z" />
            <circle className="mascot-layer--ai-badge mascot-ai-badge" cx="120" cy="184" r="27" />
            <circle className="mascot-ai-badge-ring" cx="120" cy="184" r="21" />
            <text className="mascot-ai-badge-text" x="120" y="193" textAnchor="middle">AI</text>
            <path className="mascot-layer--suit-lines mascot-panel-line" d="M79 171 L99 178 L103 205 L88 223" />
            <path className="mascot-layer--suit-lines mascot-panel-line" d="M161 171 L140 178 L136 205 L152 224" />
            <path className="mascot-layer--suit-lines mascot-panel-line mascot-panel-line--glow" d="M86 164 L104 170" />
            <path className="mascot-layer--suit-lines mascot-panel-line mascot-panel-line--glow" d="M136 170 L154 164" />
            <path className="mascot-cyan-slot" d="M78 196 L96 204" />
            <path className="mascot-cyan-slot" d="M144 204 L162 196" />
          </g>

          <g className="mascot-bone mascot-bone--left-arm mascot-layer--left-arm">
            <path className="mascot-suit-limb" d="M74 158 C45 168 35 202 51 222 C64 237 83 226 82 210 C79 188 84 174 96 166 Z" />
            <path className="mascot-purple-cuff" d="M47 213 C57 227 75 230 84 216 C82 228 74 239 60 238 C49 236 42 227 40 218 Z" />
            <path className="mascot-panel-line mascot-layer--suit-lines" d="M57 177 C64 181 73 182 82 179" />
          </g>

          <g className="mascot-bone mascot-bone--right-arm mascot-layer--right-arm">
            <path className="mascot-suit-limb" d="M166 164 C184 174 194 193 190 214 C188 231 209 237 220 221 C233 199 221 168 190 157 Z" />
            <path className="mascot-purple-cuff" d="M190 212 C199 228 215 228 223 217 C223 229 216 238 204 238 C191 237 184 227 183 216 Z" />
            <path className="mascot-panel-line mascot-layer--suit-lines" d="M180 179 C189 182 197 181 204 176" />
          </g>

          <g className="mascot-bone mascot-bone--head">
            <ellipse className="mascot-layer--helmet-glass mascot-helmet-glass" cx="120" cy="87" rx="98" ry="80" />
            <path className="mascot-layer--helmet-shell mascot-helmet-shell" d="M31 98 C33 45 72 17 121 17 C170 17 207 45 210 99 C196 80 176 76 162 96 C150 112 132 118 120 111 C107 119 90 112 78 97 C64 77 44 80 31 98 Z" />
            <path className="mascot-layer--helmet-shell helmet-forehead-wave" d="M56 104 C71 70 90 77 103 94 C114 111 137 111 150 94 C164 76 184 72 199 103 C191 126 158 141 121 141 C83 141 51 126 56 104 Z" />
            <ellipse className="mascot-layer--face mascot-face-panel" cx="120" cy="105" rx="61" ry="48" />

            <g className="mascot-bone mascot-bone--eyes">
              <ellipse className="mascot-layer--eye mascot-eye left-eye" cx="95" cy="101" rx="9.5" ry="17" />
              <ellipse className="mascot-layer--eye mascot-eye right-eye" cx="145" cy="101" rx="9.5" ry="17" />
              <circle className="mascot-eye-spark" cx="99" cy="91" r="3.6" />
              <circle className="mascot-eye-spark" cx="149" cy="91" r="3.6" />
            </g>

            <ellipse className="mascot-layer--cheek mascot-cheek left-cheek" cx="78" cy="122" rx="20" ry="13" />
            <ellipse className="mascot-layer--cheek mascot-cheek right-cheek" cx="162" cy="122" rx="20" ry="13" />
            <g className="mascot-bone mascot-bone--mouth">
              <path className="mascot-layer--smile mascot-smile-mouth" d="M103 120 C110 135 130 135 137 120" />
            </g>

            <g className="mascot-layer--headset mascot-headset">
              <ellipse className="mascot-earcup mascot-earcup--left" cx="32" cy="95" rx="24" ry="34" />
              <ellipse className="mascot-earcup-core mascot-earcup-core--left" cx="32" cy="96" rx="14" ry="22" />
              <path className="mascot-ear-logo" d="M25 91 h16 c-2 7 -7 12 -16 16 Z" />
              <ellipse className="mascot-earcup mascot-earcup--right" cx="208" cy="95" rx="24" ry="34" />
              <ellipse className="mascot-earcup-core mascot-earcup-core--right" cx="208" cy="96" rx="14" ry="22" />
            </g>

            <path className="mascot-layer--microphone microphone-boom" d="M211 116 C225 128 221 151 202 158" />
            <ellipse className="mascot-layer--microphone mic-tip" cx="198" cy="160" rx="15" ry="8" />

            <g className="mascot-layer--helmet-logo wing-logo">
              <path d="M147 54 h28 c0 9 -7 16 -17 16 h-11 c-8 0 -14 6 -14 14 c0 8 6 14 14 14 h23 c-3 8 -10 14 -22 14 h-4 c-19 0 -34 -14 -34 -31 c0 -16 16 -27 37 -27 Z" />
              <path d="M143 82 h29 c-2 7 -8 11 -17 11 h-18 c1 -5 3 -8 6 -11 Z" />
            </g>

            <ellipse className="mascot-layer--helmet-highlight mascot-helmet-highlight" cx="108" cy="40" rx="72" ry="13" transform="rotate(-7 108 40)" />
            <path className="mascot-layer--helmet-highlight mascot-helmet-rim" d="M33 112 C54 151 91 168 123 166 C160 164 194 145 207 111" />
            <ellipse className="mascot-glass-edge" cx="120" cy="88" rx="101" ry="83" />
          </g>
        </g>
      </svg>
    </span>
  );
}
