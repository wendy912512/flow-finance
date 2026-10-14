import type { HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** md 20px (desktop default) · sm 16px (mobile, compact) · lg 24px (feature cards). */
  padding?: 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
}

/** The base surface: white (or dark surface) with a 1px border. Layers are separated by borders, not shadows. */
export function Card({ padding = 'md', as: Tag = 'div', className, ...rest }: CardProps) {
  return <Tag className={['fl-card', `fl-card--${padding}`, className].filter(Boolean).join(' ')} {...rest} />;
}
