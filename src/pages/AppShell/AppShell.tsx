import type { MouseEvent, ReactNode } from 'react';
import { AccountWallet } from '../../components/AccountWallet/AccountWallet';
import { Button } from '../../components/Button/Button';
import { NetWorthCard } from '../../components/NetWorthCard/NetWorthCard';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import * as demo from '../../demo/data';
import { formatAmount } from '../../lib/money';
import './AppShell.css';

export type PageId = 'overview' | 'transactions' | 'allocation' | 'goals' | 'accounts' | 'settings';

export const NAV: { id: PageId; label: string }[] = [
  { id: 'overview', label: '總覽' },
  { id: 'transactions', label: '交易' },
  { id: 'allocation', label: '薪水分配' },
  { id: 'goals', label: '存錢目標' },
  { id: 'accounts', label: '帳戶' },
  { id: 'settings', label: '設定' },
];

/** How many upcoming payments the card lists before collapsing the rest into a "還有 N 筆" link. */
const PENDING_SHOWN = 3;

export interface AppShellProps {
  active: PageId;
  onNavigate?: (page: PageId) => void;
  /** The page's own content, shown on the dark stage to the right of the panel. */
  children: ReactNode;
}

/**
 * The frame every page shares:
 * an off-white panel of today's numbers on the left, a sticky nav + month bar on the dark stage,
 * and on phones a bottom tab bar. Figures are computed from `demo/data.ts`.
 */
export function AppShell({ active, onNavigate, children }: AppShellProps) {
  const variableSpent = demo.dailyVariableSpend.reduce((s, v) => s + v, 0);
  const fixedPaid = 3300;
  const pending = [
    { day: 18, name: 'Spotify', amount: 149 },
    { day: 20, name: '電信費', amount: 599 },
    { day: 25, name: '筆電分期 2/6', amount: 3334 },
    { day: 28, name: '健身房', amount: 1288 },
  ].sort((a, b) => a.day - b.day);
  const pendingShown = pending.slice(0, PENDING_SHOWN);
  const pendingMore = pending.slice(PENDING_SHOWN);
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const daysLeft = demo.daysInMonth - demo.today.day + 1;
  const budgetLeft = demo.variableBudget - variableSpent;
  const dailyFunds = 12800;
  const fundsAfterPending = dailyFunds - pendingTotal;
  const spendable = Math.max(0, Math.min(budgetLeft, fundsAfterPending));
  const perDay = Math.floor(spendable / daysLeft);
  const limitedBy = budgetLeft <= fundsAfterPending ? '預算剩餘' : '日常資金扣待支付';

  const go = (page: PageId) => (e: MouseEvent) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(page);
  };

  return (
    <div className="fl-app">
      <aside className="fl-app__panel" aria-label="每日資訊">
        <header className="fl-app__brand">
          <div className="fl-app__logo">
            <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
              <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--primary)" />
              <path d="M8 20 L13.5 14.5 L18 18 L24 11" fill="none" stroke="var(--on-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>流向</span>
          </div>
          <Button size="md" className="fl-app__add">
            ＋ 記一筆
          </Button>
        </header>

        <div className="fl-app__title">
          <div className="fl-app__eyebrow">
            <span className="num">{demo.today.year}</span> 年 <span className="num">{demo.today.month}</span> 月 · 本月剩 <span className="num">{daysLeft}</span> 天（含今天）
          </div>
          <div className="fl-app__hero">
            <span className="fl-app__cur">NT$</span>
            <span className="text-display-1">{formatAmount(perDay)}</span>
          </div>
          <div className="fl-app__hero-label">
            今天建議可花 · 可自由花費 <span className="num fl-strong">{formatAmount(spendable)}</span> ÷ {daysLeft} 天
          </div>
        </div>

        <div className="fl-sub-grid">
          <section className="fl-sub fl-sub--wide" aria-label="日常預算">
            <div className="fl-sub__row">
              <div className="fl-sub__head">日常預算剩餘</div>
              <div className="fl-sub__meta">
                已用 <span className="num">{formatAmount(variableSpent)}</span> / <span className="num">{formatAmount(demo.variableBudget)}</span>
              </div>
            </div>
            <div className="fl-sub__value num">{formatAmount(budgetLeft)}</div>
            <ProgressBar value={variableSpent} max={demo.variableBudget} label="日常預算已用" />
          </section>

          <section className="fl-sub fl-sub--wide" aria-label="待支付">
            <div className="fl-sub__row">
              <div className="fl-sub__head">本月待支付</div>
              <div className="fl-sub__meta">
                共 <span className="num">{pending.length}</span> 筆
              </div>
            </div>
            <div className="fl-sub__value num">{formatAmount(pendingTotal)}</div>
            <ul className="fl-sub__list">
              {pendingShown.map((p) => (
                <li key={p.name}>
                  <span>
                    <span className="num fl-sub__date">
                      {demo.today.month}/{p.day}
                    </span>
                    {p.name}
                  </span>
                  <span className="num">{formatAmount(p.amount)}</span>
                </li>
              ))}
            </ul>
            {pendingMore.length > 0 && (
              <a href="#" className="fl-link fl-sub__more">
                還有 <span className="num">{pendingMore.length}</span> 筆 · <span className="num">{formatAmount(pendingMore.reduce((t, p) => t + p.amount, 0))}</span> →
              </a>
            )}
          </section>

          <section className="fl-sub" aria-label="本月收入">
            <div className="fl-sub__head">本月收入</div>
            <div className="fl-sub__value num">{formatAmount(demo.income.salary + demo.income.other)}</div>
            <div className="fl-sub__meta">
              薪資 <span className="num">{formatAmount(demo.income.salary)}</span> · 其他 <span className="num">{formatAmount(demo.income.other)}</span>
            </div>
          </section>
          <section className="fl-sub" aria-label="本月支出">
            <div className="fl-sub__head">本月支出</div>
            <div className="fl-sub__value num">{formatAmount(variableSpent + fixedPaid)}</div>
            <div className="fl-sub__meta">
              日常 <span className="num">{formatAmount(variableSpent)}</span> · 固定 <span className="num">{formatAmount(fixedPaid)}</span>
            </div>
          </section>
        </div>

        <details className="fl-sub fl-sub--how">
          <summary>今天建議可花怎麼算的？</summary>
          <dl>
            <div>
              <dt>① 預算剩餘</dt>
              <dd className="num">
                {formatAmount(demo.variableBudget)} − {formatAmount(variableSpent)} = {formatAmount(budgetLeft)}
              </dd>
            </div>
            <div>
              <dt>② 日常資金扣掉待支付</dt>
              <dd className="num">
                {formatAmount(dailyFunds)} − {formatAmount(pendingTotal)} = {formatAmount(fundsAfterPending)}
              </dd>
            </div>
            <div>
              <dt>取較小的（{limitedBy}）÷ 剩餘天數</dt>
              <dd className="num">
                {formatAmount(spendable)} ÷ {daysLeft} = {formatAmount(perDay)}
              </dd>
            </div>
          </dl>
        </details>

        <section className="fl-sub fl-sub--accounts" aria-label="帳戶">
          <div className="fl-sub__row">
            <div className="fl-sub__head">帳戶</div>
            <a href="#" className="fl-link" onClick={go('accounts')}>
              管理 →
            </a>
          </div>
          <AccountWallet
            size="sm"
            accounts={[
              { id: 'ctbc', ...demo.accounts.ctbc, available: demo.accounts.ctbc.balance - demo.accounts.ctbc.reserved },
              { id: 'yuanta', ...demo.accounts.yuanta, face: 'graphite', balanceLabel: '現金餘額', footnote: '不含 ETF 市值' },
              { id: 'cathay', ...demo.accounts.cathay, status: 'planned' },
            ]}
          />
        </section>

        <NetWorthCard bare deposits={demo.depositTotal} investmentValue={demo.investmentMarketValue} creditCardUnpaid={demo.creditCardUnpaid} />
      </aside>

      <div className="fl-app__main">
        <div className="fl-app__top">
          <nav aria-label="主選單" className="fl-app__nav">
            {NAV.map((n) => (
              <a key={n.id} href="#" aria-current={n.id === active ? 'page' : undefined} onClick={go(n.id)}>
                {n.label}
              </a>
            ))}
          </nav>
          <div className="fl-app__month">
            <button type="button" aria-label="上個月">
              ‹
            </button>
            <span>
              <span className="num">{demo.today.year}</span> 年 <span className="num">{demo.today.month}</span> 月
            </span>
            <button type="button" aria-label="下個月">
              ›
            </button>
          </div>
        </div>
        <main className="fl-app__content">{children}</main>
      </div>

      <nav aria-label="主選單" className="fl-app__tabbar">
        <a href="#" aria-current={active === 'overview' ? 'page' : undefined} onClick={go('overview')}>
          總覽
        </a>
        <a href="#" aria-current={active === 'transactions' ? 'page' : undefined} onClick={go('transactions')}>
          交易
        </a>
        <a href="#" className="fl-app__fab" aria-label="記一筆">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </a>
        <a href="#" aria-current={active === 'goals' ? 'page' : undefined} onClick={go('goals')}>
          目標
        </a>
        <a href="#" aria-current={active === 'settings' ? 'page' : undefined} onClick={go('settings')}>
          更多
        </a>
      </nav>
    </div>
  );
}
