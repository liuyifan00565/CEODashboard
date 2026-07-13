/*
 更新时间: 2026-07-13 14:28:17 CST
 更新内容: 将单一白色散光半径扩大到 88px，并把边缘淡出距离增加到 144px，适配更宽的模糊光域。
*/
/*
 更新时间: 2026-07-06 11:23:48 CST
 更新内容: 将光标效果恢复为低存在感银紫玫瑰环境柔光，仅更新 CSS 变量并保留原生光标。
*/
/*
 更新时间: 2026-07-05 23:55:52 CST
 更新内容: 停用光标附近紫色光晕，组件保持空返回以避免全屏覆盖层影响视觉。
*/
/*
 更新时间: 2026-07-03 16:11:57 CST
 更新内容: 同时监听 pointermove 和 mousemove，确保原生鼠标移动时紫色散光稳定显现。
*/
/*
 更新时间: 2026-07-03 16:09:10 CST
 更新内容: 停用黑色玻璃球光标，仅保留围绕原生可见光标的紫色光晕。
*/
/*
 更新时间: 2026-07-03 16:05:19 CST
 更新内容: 在玻璃指针旁恢复紫色小光晕，随鼠标偏移跟随且不拦截页面交互。
*/
/*
 更新时间: 2026-06-24
 更新内容: 用官方 ReactBits FluidGlass 的 lens.glb + FBO buffer 思路重做鼠标玻璃指针：
          html2canvas 抓取当前看板作为折射纹理，MeshTransmissionMaterial 只在跟随鼠标的镜片里显示折射效果；
          增加程序化点阵纹理兜底，避免现代 CSS 解析失败时指针消失。
*/
import { useEffect, useRef } from 'react';
import './GlassCursor.css';

const EDGE_FADE_DISTANCE = 144;
const EDGE_HIDE_DISTANCE = 16;
const HALO_RADIUS = 88;

export default function GlassCursor() {
  const haloRef = useRef(null);

  useEffect(() => {
    const halo = haloRef.current;
    if (!halo) return undefined;

    const finePointerQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(pointer: fine)') : null;
    const reducedMotionQuery =
      typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

    const canShowHalo = () =>
      finePointerQuery?.matches !== false && reducedMotionQuery?.matches !== true;

    let animationFrameId = 0;
    let nextPointer = null;

    const hideHalo = () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
        animationFrameId = 0;
      }
      nextPointer = null;
      halo.classList.remove('is-active');
    };

    const renderHalo = () => {
      animationFrameId = 0;
      if (!nextPointer) return;

      const { x, y } = nextPointer;
      const edgeDistance = Math.max(
        0,
        Math.min(x, y, window.innerWidth - x, window.innerHeight - y),
      );
      const edgeOpacity = Math.max(
        0,
        Math.min(1, (edgeDistance - EDGE_HIDE_DISTANCE) / EDGE_FADE_DISTANCE),
      );
      const { classList, style } = halo;
      style.left = `${x - HALO_RADIUS}px`;
      style.top = `${y - HALO_RADIUS}px`;
      style.setProperty('--glass-cursor-edge-opacity', edgeOpacity.toFixed(3));
      classList.add('is-active');
    };

    const handlePointerMove = (event) => {
      if (!canShowHalo()) {
        hideHalo();
        return;
      }

      nextPointer = { x: event.clientX, y: event.clientY };
      if (!animationFrameId) {
        animationFrameId = window.requestAnimationFrame(renderHalo);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('blur', hideHalo);
    document.addEventListener('visibilitychange', hideHalo);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', hideHalo);
      document.removeEventListener('visibilitychange', hideHalo);
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <div ref={haloRef} className="glass-cursor-halo" aria-hidden="true" />;
}
