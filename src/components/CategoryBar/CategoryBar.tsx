import { formatAmount, formatPercent } from '../../lib/money';
import './CategoryBar.css';

export interface CategoryAmount {
  key: string;
  name: string;
  amount: number;
}

export interface CategoryBarProps {
  items: CategoryAmount[];
  /**
   * Fixed colour slot per category key (1–5). Colour follows the category, never its rank,
   * so filtering never repaints. Categories without a slot fold into 其他.
   */
  slots?: Record<string, 1 | 2 | 3 | 4 | 5>;
}

const defaultSlots: Record<string, 1 | 2 | 3 | 4 | 5> = { food: 1, housing: 2, transport: 3, shopping: 4, fun: 5 };

/** Spending split as one stacked bar with a labelled legend (every segment's name and amount is printed). */
export function CategoryBar({ items, slots = defaultSlots }: CategoryBarProps) {
  const total = items.reduce((s, i) => s + i.amount, 0);
  const slotted = items.filter((i) => slots[i.key]).sort((a, b) => slots[a.key] - slots[b.key]);
  const rest = items.filter((i) => !slots[i.key]);
  const other = rest.reduce((s, i) => s + i.amount, 0);
  const rows = [
    ...slotted.map((i) => ({ ...i, color: `var(--chart-${slots[i.key]})` })),
    ...(other > 0 ? [{ key: 'other', name: `其他（${rest.map((r) => r.name).join('、')}）`, amount: other, color: 'var(--chart-other)' }] : []),
  ];

  if (total === 0) return <p className="fl-cat__empty">本月還沒有支出。</p>;

  return (
    <div className="fl-cat">
      <div className="fl-cat__bar" aria-hidden="true">
        {rows.map((r) => (
          <span key={r.key} className="fl-cat__seg" style={{ flexGrow: r.amount, background: r.color }} title={`${r.name} ${formatAmount(r.amount)}`} />
        ))}
      </div>
      <ul className="fl-cat__legend" aria-label={`支出類別，共 ${formatAmount(total)} 元`}>
        {rows.map((r) => (
          <li key={r.key}>
            <span className="fl-cat__swatch" style={{ background: r.color }} aria-hidden="true" />
            <span className="fl-cat__name">{r.name}</span>
            <span className="fl-cat__pct num">{formatPercent(r.amount, total)}</span>
            <span className="fl-cat__amt num">{formatAmount(r.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
