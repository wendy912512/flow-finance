import { AccountWallet } from '../../components/AccountWallet/AccountWallet';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { CategoryBar } from '../../components/CategoryBar/CategoryBar';
import { FlightGoalHero } from '../../components/FlightGoalHero/FlightGoalHero';
import { NetWorthCard } from '../../components/NetWorthCard/NetWorthCard';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { SpendingChart } from '../../components/SpendingChart/SpendingChart';
import { TransactionRow } from '../../components/TransactionRow/TransactionRow';
import * as demo from '../../demo/data';
import { computeGoalProgress } from '../../lib/goals';
import { formatAmount } from '../../lib/money';
import './Overview.css';

export interface OverviewProps {
  animateIn?: boolean;
}

const nav = ['總覽', '交易', '薪水分配', '存錢目標', '帳戶', '設定'];

/** 總覽 page assembled from demo data. Every figure shown is computed from `demo/data.ts`. */
export function Overview({ animateIn = true }: OverviewProps) {
  const variableSpent = demo.dailyVariableSpend.reduce((s, v) => s + v, 0);
  const fixedPaid = 3300;
  const pending = [
    { day: 20, name: '電信費', detail: '固定支出 · 中信扣款', amount: 599 },
    { day: 25, name: '筆電分期', detail: '第 2/6 期 · 中信扣款', amount: 3334 },
  ];
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const daysLeft = demo.daysInMonth - demo.today.day + 1;
  const budgetLeft = demo.variableBudget - variableSpent;
  const dailyFunds = 12800;
  const fundsAfterPending = dailyFunds - pendingTotal;
  const spendable = Math.max(0, Math.min(budgetLeft, fundsAfterPending));
  const perDay = Math.floor(spendable / daysLeft);
  const limitedBy = budgetLeft <= fundsAfterPending ? '預算剩餘' : '日常資金扣待支付';

  const others = [
    { name: '緊急預備金', target: 60000, saved: 18000, deadline: { year: 2027, month: 6 }, monthlyPlan: 2000 },
    { name: '考多益課程', target: 12000, saved: 7200, deadline: { year: 2026, month: 12 }, monthlyPlan: 2000 },
    { name: '露營裝備', target: 15000, saved: 0, deadline: { year: 2027, month: 6 }, monthlyPlan: null },
  ];
  const statusText = { 'on-track': '可如期', behind: '需要調整', 'no-plan': '尚無法推估', overdue: '已過預計日期', achieved: '已達標' } as const;

  return (
    <div className="fl-page fl-backdrop">
      <header className="fl-page__top">
        <div className="fl-page__brand">
          <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="1" y="1" width="30" height="30" rx="9" fill="var(--primary)" />
            <path d="M8 20 L13.5 14.5 L18 18 L24 11" fill="none" stroke="var(--on-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>流向</span>
        </div>
        <nav aria-label="主選單" className="fl-page__nav">
          {nav.map((n, i) => (
            <a key={n} href="#" aria-current={i === 0 ? 'page' : undefined}>
              {n}
            </a>
          ))}
        </nav>
        <div className="fl-page__actions">
          <div className="fl-page__month">
            <button type="button" aria-label="上個月">‹</button>
            <span>
              <span className="num">{demo.today.year}</span> 年 <span className="num">{demo.today.month}</span> 月
            </span>
            <button type="button" aria-label="下個月">›</button>
          </div>
          <Button className="fl-page__add">＋ 記一筆</Button>
        </div>
      </header>

      <div className="fl-shell">
        <aside className="fl-panel" aria-label="每日資訊">
          <section className="fl-panel__sec fl-today" aria-label="今天建議可花">
            <div className="fl-today__label">
              今天建議可花 · 本月剩 <span className="num">{daysLeft}</span> 天（含今天）
            </div>
            <div className="text-display-1 fl-today__value">
              <span className="fl-today__cur">NT$</span>
              {formatAmount(perDay)}
            </div>
            <div className="fl-today__meta">
              可自由花費 <span className="num fl-strong">{formatAmount(spendable)}</span> ÷ {daysLeft} 天
            </div>
            <div className="fl-today__budget">
              <div className="fl-today__row">
                <span>日常預算已用</span>
                <span className="num">
                  {formatAmount(variableSpent)} / {formatAmount(demo.variableBudget)}
                </span>
              </div>
              <ProgressBar value={variableSpent} max={demo.variableBudget} label="日常預算已用" />
            </div>
            <details className="fl-today__how">
              <summary>這個數字怎麼算的？</summary>
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
                  <dt>取兩者較小（{limitedBy}）÷ 剩餘天數</dt>
                  <dd className="num">
                    {formatAmount(spendable)} ÷ {daysLeft} = {formatAmount(perDay)}
                  </dd>
                </div>
              </dl>
            </details>
          </section>

          <section className="fl-panel__sec fl-month" aria-label="本月數字">
            <h2 className="fl-card-title">本月</h2>
            <div className="fl-tiles">
            <div className="fl-tile">
              <span className="fl-tile__label">本月收入</span>
              <span className="fl-tile__value num">{formatAmount(demo.income.salary + demo.income.other)}</span>
              <span className="fl-tile__meta">
                薪資 <span className="num">{formatAmount(demo.income.salary)}</span> · 其他 <span className="num">{formatAmount(demo.income.other)}</span>
              </span>
            </div>
            <div className="fl-tile">
              <span className="fl-tile__label">本月支出</span>
              <span className="fl-tile__value num">{formatAmount(variableSpent + fixedPaid)}</span>
              <span className="fl-tile__meta">
                日常 <span className="num">{formatAmount(variableSpent)}</span> · 固定已付 <span className="num">{formatAmount(fixedPaid)}</span>
              </span>
            </div>
            <div className="fl-tile">
              <span className="fl-tile__label">日常預算剩餘</span>
              <span className="fl-tile__value num">{formatAmount(budgetLeft)}</span>
              <span className="fl-tile__meta">
                預算 <span className="num">{formatAmount(demo.variableBudget)}</span> − 已花 <span className="num">{formatAmount(variableSpent)}</span>
              </span>
            </div>
            <div className="fl-tile">
              <span className="fl-tile__label">本月待支付</span>
              <span className="fl-tile__value num">{formatAmount(pendingTotal)}</span>
              <span className="fl-tile__meta">
                {pending.length} 筆 · 最近 10/{pending[0].day} {pending[0].name}
              </span>
            </div>
          </div>
          </section>

          <section className="fl-panel__sec fl-accounts" aria-label="帳戶">
            <div className="fl-card-head">
              <h2 className="fl-card-title">帳戶</h2>
              <a href="#" className="fl-link">
                管理 →
              </a>
            </div>
            <AccountWallet
              accounts={[
                { id: 'ctbc', ...demo.accounts.ctbc, available: demo.accounts.ctbc.balance - demo.accounts.ctbc.reserved },
                { id: 'yuanta', ...demo.accounts.yuanta, face: 'graphite', balanceLabel: '現金餘額', footnote: '不含 ETF 市值' },
                { id: 'cathay', ...demo.accounts.cathay, status: 'planned' },
              ]}
            />
          </section>

          <NetWorthCard bare deposits={demo.depositTotal} investmentValue={demo.investmentMarketValue} creditCardUnpaid={demo.creditCardUnpaid} />
        </aside>

        <div className="fl-shell__stage">
          <FlightGoalHero {...demo.iceland} today={demo.thisMonth} animateIn={animateIn} />
        </div>
      </div>

      <main className="fl-analysis" aria-label="本月分析">


          <section className="fl-two" aria-label="支出分析">
            <Card>
              <div className="fl-card-head">
                <h2 className="fl-card-title">本月日常支出累計</h2>
                <span className="fl-tile__meta">點或移到線上看每天</span>
              </div>
              <SpendingChart daily={demo.dailyVariableSpend} daysInMonth={demo.daysInMonth} month={demo.today.month} budget={demo.variableBudget} />
            </Card>
            <Card>
              <div className="fl-card-head">
                <h2 className="fl-card-title">本月支出類別</h2>
                <span className="num fl-tile__meta">共 {formatAmount(variableSpent + fixedPaid)}</span>
              </div>
              <CategoryBar items={demo.categorySpend} />
            </Card>
          </section>

          <section className="fl-two" aria-label="待支付與交易">
            <Card>
              <div className="fl-card-head">
                <h2 className="fl-card-title">最近交易</h2>
                <a href="#" className="fl-link">
                  全部 →
                </a>
              </div>
              <TransactionRow kind="expense" title="路易莎咖啡" date="今天" detail="餐飲" amount={135} autoCategorized />
              <TransactionRow kind="expense" title="台北捷運" date="10/13" detail="交通" amount={45} autoCategorized />
              <TransactionRow kind="expense" title="蝦皮購物" date="10/12" detail="購物" amount={680} />
              <TransactionRow kind="income" title="十月薪資" date="10/10" detail="收入 · 中信" amount={32000} glyph="薪" />
            </Card>
            <Card>
              <div className="fl-card-head">
                <h2 className="fl-card-title">其他目標</h2>
                <a href="#" className="fl-link">
                  全部 →
                </a>
              </div>
              <div className="fl-goals-mini">
                {others.map((g) => {
                  const p = computeGoalProgress(g, demo.thisMonth);
                  return (
                    <div key={g.name} className="fl-goals-mini__row">
                      <div className="fl-today__row">
                        <span className="fl-strong">{g.name}</span>
                        <span className={`fl-goals-mini__status is-${p.status}`}>{statusText[p.status]}</span>
                      </div>
                      <ProgressBar value={g.saved} max={g.target} tone="savings" label={`${g.name}進度`} />
                      <span className="num fl-tile__meta">
                        已存 {formatAmount(g.saved)} / {formatAmount(g.target)} · {p.percentLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </section>
      </main>

      <nav aria-label="主選單" className="fl-page__tabbar">
        <a href="#" aria-current="page">總覽</a>
        <a href="#">交易</a>
        <a href="#" className="fl-page__fab" aria-label="記一筆">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </a>
        <a href="#">目標</a>
        <a href="#">更多</a>
      </nav>
    </div>
  );
}
