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
import { useRef, useEffect, useState } from 'react';
import './GlassCursor.css';

export default function GlassCursor() {
  const [haloVisible, setHaloVisible] = useState(false);
  const haloRef = useRef(null);

  useEffect(() => {
    let revealed = false;

    const onPointerMove = (event) => {
      const halo = haloRef.current;
      if (!halo) return;
      halo.style.setProperty('--glass-cursor-x', `${event.clientX}px`);
      halo.style.setProperty('--glass-cursor-y', `${event.clientY}px`);
      if (!revealed) {
        revealed = true;
        setHaloVisible(true);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('mousemove', onPointerMove);
    };
  }, []);

  const haloClassName = haloVisible ? 'glass-cursor-halo glass-cursor-halo--visible' : 'glass-cursor-halo';

  return (
    <div className="glass-cursor-fixed">
      <div ref={haloRef} className={haloClassName} aria-hidden="true" />
    </div>
  );
}
