/*
 更新时间: 2026-06-25 11:38:51
 更新内容: 环绕字符改为圆心定位，新增 radiusPx 精确控制玻璃球内文字半径。
*/
import './CircularText.css';

const CircularText = ({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  radiusPercent = -46,
  radiusPx,
}) => {
  const letters = Array.from(text);
  const hoverClass = onHover ? `circular-text--${onHover}` : '';
  const radiusDistance = typeof radiusPx === 'number' ? `${-Math.abs(radiusPx)}px` : `${radiusPercent * 2}px`;

  return (
    <div
      className={`circular-text ${hoverClass} ${className}`}
      style={{ '--ct-spin-duration': `${spinDuration}s` }}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const transform = `translate(-50%, -50%) rotate(${rotationDeg}deg) translateY(${radiusDistance}) rotate(180deg)`;

        return (
          <span key={`${letter}-${i}`} style={{ transform, WebkitTransform: transform }}>
            {letter}
          </span>
        );
      })}
    </div>
  );
};

export default CircularText;
