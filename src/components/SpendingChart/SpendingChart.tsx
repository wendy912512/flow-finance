import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { formatAmount } from '../../lib/money';
import './SpendingChart.css';

export interface SpendingChartProps {
  /** Whole-dollar variable spending per day, index 0 = day 1, up to and including today. */
  daily: number[];
  daysInMonth: number;
  month: number;
  /** The month's variable budget, drawn as a reference line. */
  budget: number;
  height?: number;
}

const niceStep = (max: number) => {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
};
const shortK = (v: number) => (v === 0 ? '0' : v % 1000 === 0 ? `${v / 1000}k` : formatAmount(v));

/**
 * Cumulative variable spending this month against the budget. Every point is a real day's
 * running total; hover (or focus and use arrow keys) to read a day's spending.
 */
export function SpendingChart({ daily, daysInMonth, month, budget, height = 200 }: SpendingChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);
  const [hover, setHover] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cumulative = useMemo(() => daily.reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + v], []), [daily]);
  const spent = cumulative.at(-1) ?? 0;
  const today = daily.length;

  const pad = { top: 16, right: 48, bottom: 28, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const step = niceStep(Math.max(budget, spent) * 1.05);
  const yMax = Math.ceil((Math.max(budget, spent) * 1.05) / step) * step;
  const yTicks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);
  const x = (day: number) => pad.left + ((day - 1) / (daysInMonth - 1)) * innerW;
  const y = (v: number) => pad.top + innerH - (v / yMax) * innerH;
  const xTicks = [1, 8, 15, 22, daysInMonth];

  const line = cumulative.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i + 1).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(today).toFixed(1)} ${y(0)} L${x(1).toFixed(1)} ${y(0)} Z`;
  const active = hover ?? today;
  const activeDay = active - 1;

  const onMove = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const day = Math.round(((clientX - rect.left - pad.left) / innerW) * (daysInMonth - 1)) + 1;
    setHover(Math.min(today, Math.max(1, day)));
  };

  const tipLeft = Math.min(Math.max(x(active), 80), width - 80);

  return (
    <figure className="fl-spend" aria-label={`本月累計變動支出，到 ${month}/${today} 共 ${formatAmount(spent)} 元，日常預算 ${formatAmount(budget)} 元`}>
      <div
        ref={wrapRef}
        className="fl-spend__plot"
        tabIndex={0}
        onMouseMove={(e) => onMove(e.clientX)}
        onMouseLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setHover(Math.max(1, active - 1));
          if (e.key === 'ArrowRight') setHover(Math.min(today, active + 1));
          if (e.key === 'Escape') setHover(null);
        }}
        onBlur={() => setHover(null)}
      >
        <svg width={width} height={height} aria-hidden="true">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={pad.left + innerW} y1={y(t)} y2={y(t)} className="fl-spend__grid" />
              <text x={width - pad.right + 8} y={y(t) + 4} className="fl-spend__axis">
                {shortK(t)}
              </text>
            </g>
          ))}
          {xTicks.map((d) => (
            <text key={d} x={x(d)} y={height - 8} textAnchor={d === 1 ? 'start' : d === daysInMonth ? 'end' : 'middle'} className="fl-spend__axis">
              {month}/{d}
            </text>
          ))}
          <line x1={pad.left} x2={pad.left + innerW} y1={y(budget)} y2={y(budget)} className="fl-spend__budget" />
          <text x={pad.left + innerW} y={y(budget) - 6} textAnchor="end" className="fl-spend__budget-label">
            日常預算 {formatAmount(budget)}
          </text>
          <path d={area} className="fl-spend__area" />
          <path d={line} className="fl-spend__line" />
          <line x1={x(active)} x2={x(active)} y1={pad.top} y2={y(0)} className="fl-spend__cross" />
          <circle cx={x(active)} cy={y(cumulative[activeDay])} r={5} className="fl-spend__dot" />
        </svg>
        <div className="fl-spend__tip" style={{ left: tipLeft }} role="status">
          <strong className="num">
            {month}/{active}
            {hover === null && '（今天）'}
          </strong>
          <span>
            當日 <span className="num">{formatAmount(daily[activeDay])}</span> · 累計 <span className="num">{formatAmount(cumulative[activeDay])}</span>
          </span>
        </div>
      </div>
      <table className="visually-hidden">
        <caption>每日變動支出</caption>
        <thead>
          <tr>
            <th scope="col">日期</th>
            <th scope="col">當日</th>
            <th scope="col">累計</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((v, i) => (
            <tr key={i}>
              <td>
                {month}/{i + 1}
              </td>
              <td>{formatAmount(v)}</td>
              <td>{formatAmount(cumulative[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
