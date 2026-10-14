import { useState } from 'react';
import { TransactionRow } from '../../components/TransactionRow/TransactionRow';
import * as demo from '../../demo/data';
import { formatAmount } from '../../lib/money';
import { AppShell, type PageId } from '../AppShell/AppShell';
import './Transactions.css';

export interface TransactionsProps {
  onNavigate?: (page: PageId) => void;
}

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'expense', label: '支出' },
  { id: 'income', label: '收入' },
  { id: 'transfer', label: '轉帳' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

const weekday = (day: number) => '日一二三四五六'[new Date(demo.today.year, demo.today.month - 1, day).getDay()];

/** 交易: this month's transactions grouped by day, filterable by type. */
export function Transactions({ onNavigate }: TransactionsProps) {
  const [filter, setFilter] = useState<FilterId>('all');
  const rows = demo.recentTransactions.filter((t) => filter === 'all' || t.kind === filter);
  const days = [...new Set(rows.map((t) => t.day))];

  return (
    <AppShell active="transactions" onNavigate={onNavigate}>
      <section className="fl-glass tx-page" aria-labelledby="tx-title">
        <div className="tx-page__head">
          <div>
            <h1 id="tx-title" className="tx-page__title">
              交易紀錄
            </h1>
            <p className="tx-page__sub">
              <span className="num">{demo.today.month}</span> 月 · 示範資料，只列出部分交易
            </p>
          </div>
          <div className="tx-page__filters" role="radiogroup" aria-label="交易類型">
            {FILTERS.map((f) => (
              <button key={f.id} type="button" role="radio" aria-checked={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {days.length === 0 && <p className="tx-page__empty">這個類型本月還沒有交易。</p>}
        {days.map((day) => {
          const items = rows.filter((t) => t.day === day);
          const out = items.filter((t) => t.kind === 'expense').reduce((s, t) => s + t.amount, 0);
          return (
            <section key={day} className="tx-page__day" aria-label={`${demo.today.month}/${day}`}>
              <div className="tx-page__day-head">
                <span>
                  <span className="num">
                    {demo.today.month}/{day}
                  </span>
                  （{day === demo.today.day ? '今天' : `週${weekday(day)}`}）
                </span>
                {out > 0 && (
                  <span className="num">
                    支出 {formatAmount(out)}
                  </span>
                )}
              </div>
              {items.map((t) => (
                <TransactionRow
                  key={t.id}
                  kind={t.kind}
                  title={t.title}
                  date={t.account}
                  detail={t.category}
                  amount={t.amount}
                  autoCategorized={t.autoCategorized}
                  glyph={t.glyph}
                />
              ))}
            </section>
          );
        })}
      </section>
    </AppShell>
  );
}
