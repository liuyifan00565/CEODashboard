/*
 更新时间: 2026-06-25 15:50:21
 更新内容: ECharts 封装新增 ResizeObserver，卡片拖拽缩放后图表跟随容器尺寸重绘。
 用法：<EChart option={option} style={{height:240}} />
*/
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export default function EChart({ option, style, className }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    chartRef.current = echarts.init(ref.current, null, { renderer: 'canvas' });
    const onResize = () => chartRef.current?.resize();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(onResize)
      : null;

    window.addEventListener('resize', onResize);
    observer?.observe(ref.current);
    return () => {
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} className={className} style={{ width: '100%', height: 260, ...style }} />;
}
