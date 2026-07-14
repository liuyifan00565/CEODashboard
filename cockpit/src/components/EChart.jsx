/*
 更新时间: 2026-07-14 15:14:00 CST
 更新内容: 新增可选 onBlankClick，使用 ZRender 空白命中事件支持画布空白区点击，并在变更和卸载时解绑。
*/
/*
 更新时间: 2026-07-14 12:10:00 CST
 更新内容: 新增可选 onEvents 图表事件映射，用于售前试用环图联动筛选，并在变更和卸载时解绑监听。
*/
/*
 更新时间: 2026-07-13 20:00:00 CST
 更新内容: ResizeObserver 回调加 rAF 合帧 +「测量尺寸未变化就跳过 resize()」守卫，防止容器存在循环依赖
 （例如某个父级用 flex:1/auto 高度包裹图表，图表渲染尺寸又反过来影响父级测量出的高度）时触发
 「resize -> 容器变化 -> 再次 resize」无限循环，把标签页卡死（算力用量分析页两个饼图曾出现过“无限变大”）。
 根因在对应 CSS（改成确定高度），这里是兜底：即使别处再出现类似循环依赖，也只会最多每帧重算一次，
 且尺寸不再变化时立即停止，不会再把整个标签页拖垮。移植自 experiment 分支的同名修复。
*/
/*
 更新时间: 2026-06-25 15:50:21
 更新内容: ECharts 封装新增 ResizeObserver，卡片拖拽缩放后图表跟随容器尺寸重绘。
 用法：<EChart option={option} style={{height:240}} />
*/
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function EChart({ option, style, className, onEvents = null, onBlankClick = null }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current, null, { renderer: 'canvas' });

    let rafId = 0;
    let lastWidth = -1;
    let lastHeight = -1;

    const measureAndResize = () => {
      rafId = 0;
      const el = ref.current;
      if (!el) return;
      const { clientWidth, clientHeight } = el;
      // Size didn't actually change since the last resize — stop here. Without this guard,
      // a container with a circular auto-height dependency on the chart's own render would
      // keep re-triggering ResizeObserver forever and pin the tab's CPU.
      if (clientWidth === lastWidth && clientHeight === lastHeight) return;
      lastWidth = clientWidth;
      lastHeight = clientHeight;
      chartRef.current?.resize();
    };

    const onResize = () => {
      if (rafId) return; // already scheduled this frame, coalesce bursts
      rafId = requestAnimationFrame(measureAndResize);
    };

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(onResize)
      : null;

    window.addEventListener('resize', onResize);
    observer?.observe(ref.current);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !onEvents) return undefined;

    const entries = Object.entries(onEvents).filter(([, handler]) => typeof handler === 'function');
    entries.forEach(([eventName, handler]) => chart.on(eventName, handler));

    return () => {
      entries.forEach(([eventName, handler]) => chart.off(eventName, handler));
    };
  }, [onEvents]);

  useEffect(() => {
    const zr = chartRef.current?.getZr();
    if (!zr || typeof onBlankClick !== 'function') return undefined;

    const handleBlankClick = (event) => {
      if (event.target) return;
      event.event?.stopPropagation?.();
      onBlankClick(event);
    };

    zr.on('click', handleBlankClick);
    return () => zr.off('click', handleBlankClick);
  }, [onBlankClick]);

  return <div ref={ref} className={className} style={{ width: '100%', height: 260, ...style }} />;
}
