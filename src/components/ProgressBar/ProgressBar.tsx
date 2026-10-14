import './ProgressBar.css';

export interface ProgressBarProps {
  value: number;
  max: number;
  /** budget → blue, turns red and full when over max. savings → green. */
  tone?: 'budget' | 'savings';
  size?: 'md' | 'lg';
  /** Show 25/50/75% ticks (savings goals). */
  milestones?: boolean;
  /** Accessible name, e.g. "餐飲預算". */
  label: string;
}

export function ProgressBar({ value, max, tone = 'budget', size = 'md', milestones = false, label }: ProgressBarProps) {
  const ratio = max > 0 ? value / max : 0;
  const over = tone === 'budget' && value > max;
  const width = Math.max(0, Math.min(100, ratio * 100));
  const variant = over ? 'danger' : tone;
  return (
    <div
      className={`fl-progress fl-progress--${variant} fl-progress--${size}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="fl-progress__bar" style={{ width: `${width}%` }} />
      {milestones &&
        [25, 50, 75].map((m) => <span key={m} className="fl-progress__tick" style={{ left: `${m}%` }} aria-hidden="true" />)}
    </div>
  );
}
