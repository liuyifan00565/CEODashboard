/* 更新时间: 2026-06-29 10:45:53  更新内容: 新增多选分段控件，用于 KPI 二级弹窗销售维度多选筛选。 */
import GlassSurface from './GlassSurface/GlassSurface';
import './MultiSegmented.css';

export default function MultiSegmented({ options = [], value = [], onChange, minSelected = 1 }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const glassWidth = options.reduce((total, opt) => {
    const labelLength = String(opt.label ?? '').length;
    return total + Math.max(54, labelLength * 15 + 32);
  }, 8);

  const toggle = (nextValue) => {
    const exists = selectedValues.includes(nextValue);
    const next = exists
      ? selectedValues.filter((item) => item !== nextValue)
      : [...selectedValues, nextValue];
    if (next.length < minSelected) return;
    onChange?.(next);
  };

  return (
    <GlassSurface
      width={glassWidth}
      height={42}
      borderRadius={12}
      brightness={58}
      blur={12}
      displace={1}
      backgroundOpacity={0.07}
      distortionScale={-120}
      className="msgm-glass"
    >
      <div className="msgm-wrap" role="group">
        {options.map((opt) => {
          const selected = selectedValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              className={`msgm-btn${selected ? ' msgm-btn--active' : ''}`}
              onClick={() => toggle(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </GlassSurface>
  );
}
