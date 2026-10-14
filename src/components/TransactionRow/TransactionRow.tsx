import { formatAmount } from '../../lib/money';
import { Badge } from '../Badge/Badge';
import './TransactionRow.css';

/**
 * expense / income change the month's totals.
 * transfer / investment move money between your own pockets — no sign, never counted as income or spending.
 */
export type TransactionKind = 'expense' | 'income' | 'transfer' | 'investment';

export interface TransactionRowProps {
  kind: TransactionKind;
  title: string;
  /** e.g. "10/14" or "今天" */
  date: string;
  /** Category for expense/income, or a short note for transfers ("轉帳 · 薪水分配"). */
  detail: string;
  /** Always a positive whole-dollar amount; the sign comes from `kind`. */
  amount: number;
  /** Category was filled in by the auto-categorisation rules. */
  autoCategorized?: boolean;
  /** One character or icon for the leading tile. Defaults to the first character of `detail`. */
  glyph?: string;
  onClick?: () => void;
}

export function TransactionRow({ kind, title, date, detail, amount, autoCategorized = false, glyph, onClick }: TransactionRowProps) {
  const signed = kind === 'expense' ? -Math.abs(amount) : Math.abs(amount);
  const text = formatAmount(signed, { sign: kind === 'expense' || kind === 'income' ? 'always' : 'none' });
  const content = (
    <>
      <span className={`fl-tx__icon fl-tx__icon--${kind}`} aria-hidden="true">
        {glyph ?? detail.charAt(0)}
      </span>
      <span className="fl-tx__main">
        <span className="fl-tx__title">{title}</span>
        <span className="fl-tx__meta">
          {date} · {detail}
          {autoCategorized && <Badge tone="neutral" size="sm">自動</Badge>}
        </span>
      </span>
      <span className={`fl-tx__amount num fl-tx__amount--${kind}`}>{text}</span>
    </>
  );
  return onClick ? (
    <button type="button" className="fl-tx fl-tx--button" onClick={onClick}>
      {content}
    </button>
  ) : (
    <div className="fl-tx">{content}</div>
  );
}
