import type { HTMLAttributes } from 'react';
import './Card.css';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  /** md 20px (desktop default) · sm 16px (mobile, compact) · lg 24px (feature cards). */
  padding?: 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section' | 'aside';
  /**
   * solid — off-white information card (default).
   * stage — the black stage for 3D visuals; same in both themes.
   * stage-glass — translucent panel floating on top of a stage.
   */
  surface?: 'solid' | 'stage' | 'stage-glass';
}

/** The base surface. Information lives on off-white cards; 3D visuals live on the black stage. */
export function Card({ padding = 'md', as: Tag = 'div', surface = 'solid', className, ...rest }: CardProps) {
  return <Tag className={['fl-card', `fl-card--${padding}`, `fl-card--${surface}`, className].filter(Boolean).join(' ')} {...rest} />;
}
