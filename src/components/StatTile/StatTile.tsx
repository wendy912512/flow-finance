import type { ReactNode } from 'react';
import { Amount } from '../Amount/Amount';
import { Card } from '../Card/Card';
import './StatTile.css';

export interface StatTileProps {
  label: string;
  value: number;
  /** One line explaining where the number comes from. */
  meta?: ReactNode;
  /** The single most important number on the screen (today's spendable). Use once per page. */
  hero?: boolean;
  currency?: boolean;
  /** Optional status badge shown next to the value. */
  badge?: ReactNode;
  padding?: 'sm' | 'md';
}

export function StatTile({ label, value, meta, hero = false, currency = false, badge, padding = 'md' }: StatTileProps) {
  return (
    <Card padding={padding} className="fl-stat">
      <span className="fl-stat__label">{label}</span>
      <div className="fl-stat__row">
        <Amount value={value} size={hero ? 'hero' : 'lg'} tone={hero ? 'primary' : 'default'} currency={currency || hero} />
        {badge}
      </div>
      {meta && <span className="fl-stat__meta">{meta}</span>}
    </Card>
  );
}
