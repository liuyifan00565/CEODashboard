/* 更新时间: 2026-06-24  更新内容: 新建 NumberRoll 数字滚动组件，使用 GSAP 对代理对象补间动画并格式化输出 */
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function NumberRoll({ value = 0, decimals = 0, prefix = '', suffix = '', duration = 1.4 }) {
  const spanRef = useRef(null);
  const proxyRef = useRef({ n: 0 });
  const tweenRef = useRef(null);

  useEffect(() => {
    const proxy = proxyRef.current;
    const target = Number(value) || 0;

    const format = (num) => {
      const formatted = num.toLocaleString('zh-CN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      return `${prefix}${formatted}${suffix}`;
    };

    if (tweenRef.current) tweenRef.current.kill();

    tweenRef.current = gsap.to(proxy, {
      n: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        if (spanRef.current) spanRef.current.textContent = format(proxy.n);
      },
      onComplete: () => {
        if (spanRef.current) spanRef.current.textContent = format(target);
      },
    });

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
        tweenRef.current = null;
      }
    };
  }, [value, decimals, prefix, suffix, duration]);

  return <span ref={spanRef} />;
}

export default NumberRoll;
