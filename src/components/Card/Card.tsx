import type { HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** md 20px (desktop default) · sm 16px (mobile, compact) · lg 24px (feature cards). */
  padding?: 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section' | 'aside';
  /** solid (default, all screens) · glass (translucent on desktop, solid on phones) · glass-strong (floating panels). */
  surface?: 'solid' | 'glass' | 'glass-strong';
}

/** The base surface: white (or dark surface) with a 1px border. Layers are separated by borders, not shadows. */
export function Card({ padding = 'md', as: Tag = 'div', surface = 'solid', className, ...rest }: CardProps) {
  const surfaceClasses = surface === 'solid' ? [] : surface === 'glass' ? ['fl-card--glass'] : ['fl-card--glass', 'fl-card--glass-strong'];
  return <Tag className={['fl-card', `fl-card--${padding}`, ...surfaceClasses, className].filter(Boolean).join(' ')} {...rest} />;
}
