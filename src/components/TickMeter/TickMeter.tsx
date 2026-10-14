import './TickMeter.css';

export interface TickMeterProps {
  value: number;
  max: number;
  label: string;
  tone?: 'savings' | 'primary' | 'warning';
  /** Percent positions of milestone markers, e.g. [25, 50, 75]. */
  marks?: number[];
}

/** A ruler-style progress bar: thin ticks, filled up to the value, with a glowing marker at the current point. */
export function TickMeter({ value, max, label, tone = 'savings', marks = [] }: TickMeterProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div className={`fl-ticks fl-ticks--${tone}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="fl-ticks__fill" style={{ width: `${pct}%` }} />
      {marks.map((m) => (
        <span key={m} className={`fl-ticks__mark${pct >= m ? ' is-done' : ''}`} style={{ left: `${m}%` }} />
      ))}
    </div>
  );
}
