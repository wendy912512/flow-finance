import type { ReactNode } from 'react';
import './Badge.css';

export type BadgeTone = 'neutral' | 'info' | 'savings' | 'warning' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  /** Prefix a shape icon so the state never relies on colour alone. Defaults to on for savings, warning and danger. */
  withIcon?: boolean;
  size?: 'md' | 'sm';
  children: ReactNode;
}

const icons: Partial<Record<BadgeTone, ReactNode>> = {
  savings: <path d="M2.5 6.5 5 9l4.5-5.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  warning: <path d="M6 1.5 10.8 10H1.2Z M6 5v2.2 M6 8.4v.2" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />,
  danger: (
    <>
      <circle cx="6" cy="6" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 3.6v2.8 M6 8.2v.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </>
  ),
};

/** A status label: the words carry the meaning, colour reinforces it. */
export function Badge({ tone = 'neutral', withIcon, size = 'md', children }: BadgeProps) {
  const showIcon = withIcon ?? (tone === 'savings' || tone === 'warning' || tone === 'danger');
  const icon = icons[tone];
  return (
    <span className={`fl-badge fl-badge--${tone} fl-badge--${size}`}>
      {showIcon && icon && (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          {icon}
        </svg>
      )}
      {children}
    </span>
  );
}
