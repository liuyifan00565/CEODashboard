/*
 更新时间: 2026-07-03 14:30:00 CST
 更新内容: 新增 ReactBits 风格 Silk 全屏背景层（WebGL 噪声域扭曲着色器），
          低饱和灰蓝紫在深海蓝黑底上极慢流动，作为 Vision Pro 风格高级材质层。
*/
import { useEffect, useRef } from 'react';
import './Silk.css';

// 默认配色：低饱和灰蓝紫，符合 Apple Vision Pro / macOS 深色模式
const DEFAULT_COLORS = ['#5F6B85', '#6B728A', '#7B7481'];

function hexToRgb3(hex) {
  const m = String(hex).match(/^#?([0-9a-f]{6})$/i);
  if (!m) return [0, 0, 0];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// 顶点着色器：全屏三角形覆盖
const VERT = `
attribute vec2 aPos;
void main(){
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// 片元着色器：simplex 噪声 + fbm + 域扭曲，生成丝绸般缓慢流动的条纹
const FRAG = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

vec3 mod289(vec3 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 permute(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// 分形布朗运动：多层噪声叠加，造出丝绸的柔长纹理
float fbm(vec3 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 5; i++){
    v += a * snoise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 p = uv * 2.0 - 1.0;
  // 适配宽高比，避免条纹被横向拉伸
  p.x *= uResolution.x / uResolution.y;

  // 极慢的时间演化，像空气里的柔和材质流动
  float t = uTime * 0.04;

  // 两层域扭曲：用噪声扰动采样坐标，产生丝绸般的长条结构
  vec3 q = vec3(p * 1.4, t);
  float n1 = fbm(q);
  vec3 r = vec3(p * 1.4 + vec2(n1 * 0.85, n1 * 0.35), t + 11.0);
  float n2 = fbm(r);
  float f = fbm(vec3(p * 1.4 + vec2(n2 * 0.6, n1 * 0.4), t + 23.0));

  // 映射到三色渐变：灰蓝 → 灰紫 → 浅灰蓝
  float v = f * 0.5 + 0.5;
  vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.5, v));
  col = mix(col, uColorC, smoothstep(0.5, 1.0, v));

  // 轻微深度暗角，让边缘更沉
  float edge = smoothstep(1.4, 0.4, length(p));
  col *= 0.82 + 0.18 * edge;

  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * Silk — ReactBits 风格的全屏丝绸背景层。
 * 仅作为高级材质层，外层 CSS 通过 opacity / 遮罩控制其可读性。
 */
export default function Silk({
  colors = DEFAULT_COLORS,
  // 速度系数：1 表示「正常慢」，0.6 表示更慢。默认已经很慢
  speed = 1,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: false })
      || canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return;

    const reduceMotion = typeof matchMedia !== 'undefined'
      && matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 编译着色器
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      // 链接失败就放弃渲染，避免阻塞页面
      return;
    }
    gl.useProgram(prog);

    // 全屏三角形：两个顶点覆盖整个 clip space
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'uResolution');
    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uA = gl.getUniformLocation(prog, 'uColorA');
    const uB = gl.getUniformLocation(prog, 'uColorB');
    const uC = gl.getUniformLocation(prog, 'uColorC');

    const [ca, cb, cc] = [colors[0], colors[1], colors[2]].map(hexToRgb3);
    gl.useProgram(prog);
    gl.uniform3fv(uA, ca);
    gl.uniform3fv(uB, cb);
    gl.uniform3fv(uC, cc);

    // 降采样：丝绸是柔材质，半分辨率即可，省 GPU
    const scale = 0.6;
    const resize = () => {
      const w = Math.max(1, Math.floor(window.innerWidth * scale));
      const h = Math.max(1, Math.floor(window.innerHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    };
    window.addEventListener('resize', onResize);

    // 标签页隐藏时暂停，避免后台耗电
    let raf = null;
    let start = performance.now();
    let hidden = false;
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden && !reduceMotion) {
        start = performance.now();
        loop();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
    };
    document.addEventListener('visibilitychange', onVis);

    const render = (timeSec) => {
      gl.uniform1f(uTime, timeSec * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = () => {
      if (hidden) return;
      const t = (performance.now() - start) / 1000;
      render(t);
      raf = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      // 尊重无障碍：只画一帧静态图
      render(0);
    } else {
      loop();
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteProgram(prog);
    };
  }, [colors, speed]);

  return (
    <div className={`silk-layer ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="silk-canvas" />
    </div>
  );
}
