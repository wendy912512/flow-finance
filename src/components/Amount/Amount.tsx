import { formatAmount, type Sign } from '../../lib/money';
import './Amount.css';

export type AmountSize = 'hero' | 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type AmountTone = 'default' | 'muted' | 'primary' | 'savings' | 'danger';

export interface AmountProps {
  /** Whole New Taiwan dollars. */
  value: number;
  size?: AmountSize;
  tone?: AmountTone;
  /** Show the "NT$" prefix. Headline amounts only. */
  currency?: boolean;
  sign?: Sign;
  className?: string;
}

/** Renders money with tabular figures so digits line up in columns and never jitter. */
export function Amount({ value, size = 'md', tone = 'default', currency = false, sign = 'auto', className }: AmountProps) {
  const classes = ['fl-amount', `text-amount-${size}`, `fl-amount--${tone}`, className].filter(Boolean).join(' ');
  return <span className={classes}>{formatAmount(value, { currency, sign })}</span>;
}
