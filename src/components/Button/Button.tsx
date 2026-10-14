import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'savings' | 'ghost';
export type ButtonSize = 'lg' | 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary — the one main action on a screen.
   * secondary — everything else.
   * savings — only for moving money into a savings goal.
   * ghost — inline text actions.
   */
  variant?: ButtonVariant;
  /** lg 48px (default, always on mobile) · md 40px · sm 32px (desktop tables only). */
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export function Button({ variant = 'primary', size = 'lg', fullWidth = false, icon, className, children, type = 'button', ...rest }: ButtonProps) {
  const classes = ['fl-btn', `fl-btn--${variant}`, `fl-btn--${size}`, fullWidth && 'fl-btn--full', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...rest}>
      {icon && <span className="fl-btn__icon" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}
