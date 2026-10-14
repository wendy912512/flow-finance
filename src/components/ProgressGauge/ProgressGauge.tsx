import './ProgressGauge.css';

export interface ProgressGaugeProps {
  /** 0–1 */
  value: number;
  /** Big text in the middle, e.g. "30%". */
  label: string;
  /** Small text under the label, e.g. "已存比例". */
  caption: string;
  size?: number;
  tone?: 'savings' | 'primary';
}

/** A 270° ring gauge for a single ratio. Decorative ring; the label carries the value for screen readers. */
export function ProgressGauge({ value, label, caption, size = 168, tone = 'savings' }: ProgressGaugeProps) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="fl-gauge" style={{ width: size, height: size }} role="img" aria-label={`${caption} ${label}`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="fl-gauge__track" cx="60" cy="60" r="52" pathLength={100} strokeDasharray="75 100" transform="rotate(135 60 60)" />
        <circle
          className={`fl-gauge__value fl-gauge__value--${tone}`}
          cx="60"
          cy="60"
          r="52"
          pathLength={100}
          strokeDasharray={`${v * 75} 100`}
          transform="rotate(135 60 60)"
        />
      </svg>
      <div className="fl-gauge__text">
        <span className="fl-gauge__label num">{label}</span>
        <span className="fl-gauge__caption">{caption}</span>
      </div>
    </div>
  );
}
