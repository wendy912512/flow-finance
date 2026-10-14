import { useMemo, useState, type KeyboardEvent } from 'react';
import { AccountWallet } from '../../components/AccountWallet/AccountWallet';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CategoryBar } from '../../components/CategoryBar/CategoryBar';
import { GoalGlobe } from '../../components/GoalGlobe/GoalGlobe';
import { NetWorthCard } from '../../components/NetWorthCard/NetWorthCard';
import { ProgressBar } from '../../components/ProgressBar/ProgressBar';
import { ProgressGauge } from '../../components/ProgressGauge/ProgressGauge';
import { SpendingChart } from '../../components/SpendingChart/SpendingChart';
import { TickMeter } from '../../components/TickMeter/TickMeter';
import { TransactionRow } from '../../components/TransactionRow/TransactionRow';
import * as demo from '../../demo/data';
import { computeGoalProgress, formatYearMonth } from '../../lib/goals';
import { formatAmount } from '../../lib/money';
import './Overview.css';

export interface OverviewProps {
  animateIn?: boolean;
}

const nav = ['總覽', '交易', '薪水分配', '存錢目標', '帳戶', '設定'];
const tabs = [
  { id: 'flight', label: '飛航進度' },
  { id: 'spend', label: '本月支出' },
  { id: 'category', label: '支出類別' },
  { id: 'tx', label: '最近交易' },
  { id: 'goals', label: '其他目標' },
] as const;
type TabId = (typeof tabs)[number]['id'];

const statusText = { 'on-track': '可如期', behind: '需要調整', 'no-plan': '尚無法推估', overdue: '已過預計日期', achieved: '已達標' } as const;

/**
 * 總覽: the 3D globe fills the whole screen; an off-white panel of daily numbers floats on the left,
 * and a translucent tabbed dock on the lower right holds the goal and the month's analysis.
 * Every figure is computed from `demo/data.ts`.
 */
export function Overview({ animateIn = true }: OverviewProps) {
  const [tab, setTab] = useState<TabId>('flight');

  const variableSpent = demo.dailyVariableSpend.reduce((s, v) => s + v, 0);
  const fixedPaid = 3300;
  const pending = [
    { day: 20, name: '電信費', amount: 599 },
    { day: 25, name: '筆電 2/6', amount: 3334 },
  ];
  const pendingTotal = pending.reduce((s, p) => s + p.amount, 0);
  const daysLeft = demo.daysInMonth - demo.today.day + 1;
  const budgetLeft = demo.variableBudget - variableSpent;
  const dailyFunds = 12800;
  const fundsAfterPending = dailyFunds - pendingTotal;
  const spendable = Math.max(0, Math.min(budgetLeft, fundsAfterPending));
  const perDay = Math.floor(spendable / daysLeft);
  const limitedBy = budgetLeft <= fundsAfterPending ? '預算剩餘' : '日常資金扣待支付';

  const goal = demo.iceland;
  const gp = computeGoalProgress(goal, demo.thisMonth);
  const ratio = Math.min(1, goal.saved / goal.target);
  const others = [
    { name: '緊急預備金', target: 60000, saved: 18000, deadline: { year: 2027, month: 6 }, monthlyPlan: 2000 },
    { name: '考多益課程', target: 12000, saved: 7200, deadline: { year: 2026, month: 12 }, monthlyPlan: 2000 },
    { name: '露營裝備', target: 15000, saved: 0, deadline: { year: 2027, month: 6 }, monthlyPlan: null },
  ];
  const route = useMemo(() => goal.route, [goal.route]);
  const view = useMemo(() => ({ latShift: -26, lngShift: 6, altitude: 2.3 }), []);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const i = tabs.findIndex((t) => t.id === tab);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    setTab(next.id);
    document.getElementById(`dock-tab-${next.id}`)?.focus();
  };

  return (
    <div className="fl-app">
      {/* ── The scene: always dark, fills the screen ── */}
      <div className="fl-app__scene">
        <GoalGlobe
          from={route.from}
          to={route.to}
          progress={ratio}
          progressLabel={`${goal.name} · ${gp.percentLabel}`}
          animateIn={animateIn}
          view={view}
          ariaLabel={`${goal.name}：從${route.from.city}飛往${route.to.city}，已存 ${gp.percentLabel}`}
        />
      </div>

      {/* ── Left panel ── */}
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
          <section className="fl-sub" aria-label="日常預算">
            <div className="fl-sub__head">日常預算剩餘</div>
            <div className="fl-sub__value num">{formatAmount(budgetLeft)}</div>
            <div className="fl-sub__meta">
              已用 <span className="num">{formatAmount(variableSpent)}</span> / <span className="num">{formatAmount(demo.variableBudget)}</span>
            </div>
            <ProgressBar value={variableSpent} max={demo.variableBudget} label="日常預算已用" />
          </section>
          <section className="fl-sub" aria-label="待支付">
            <div className="fl-sub__head">本月待支付</div>
            <div className="fl-sub__value num">{formatAmount(pendingTotal)}</div>
            <ul className="fl-sub__list">
              {pending.map((p) => (
                <li key={p.name}>
                  <span>
                    <span className="num">10/{p.day}</span> {p.name}
                  </span>
                  <span className="num">{formatAmount(p.amount)}</span>
                </li>
              ))}
            </ul>
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
            <a href="#" className="fl-link">
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

      {/* ── Floating controls on the scene ── */}
      <nav aria-label="主選單" className="fl-app__nav">
        {nav.map((n, i) => (
          <a key={n} href="#" aria-current={i === 0 ? 'page' : undefined}>
            {n}
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

      {/* ── Dock ── */}
      <section className="fl-app__dock" aria-label="目標與本月分析">
        <div className="fl-dock__bar">
          <div className="fl-dock__tabs" role="tablist" aria-label="檢視" onKeyDown={onTabKey}>
            {tabs.map((t) => (
              <button
                key={t.id}
                id={`dock-tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`dock-panel-${t.id}`}
                tabIndex={tab === t.id ? 0 : -1}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="fl-dock__goal">
            <span className="fl-dock__goal-name">優先目標：{goal.name}</span>
            <Badge tone={gp.status === 'behind' || gp.status === 'overdue' ? 'warning' : 'savings'}>{statusText[gp.status]}</Badge>
          </div>
        </div>

        <div className="fl-dock__body" role="tabpanel" id={`dock-panel-${tab}`} aria-labelledby={`dock-tab-${tab}`}>
          {tab === 'flight' && (
            <div className="fl-dock-flight">
              <ProgressGauge value={ratio} label={gp.percentLabel} caption="已存比例" />
              <div className="fl-dock-flight__rows">
                <p className="fl-dock-flight__purpose">{goal.purpose}</p>
                <div className="fl-dock-flight__head">
                  <span />
                  <span>已存</span>
                  <span>目標</span>
                  <span />
                </div>
                <div className="fl-dock-flight__row">
                  <span className="fl-dock-flight__k">總進度</span>
                  <span className="num">{formatAmount(goal.saved)}</span>
                  <span className="num">{formatAmount(goal.target)}</span>
                  <TickMeter value={goal.saved} max={goal.target} label={`${goal.name}總進度`} marks={[25, 50, 75]} />
                </div>
                <div className="fl-dock-flight__row">
                  <span className="fl-dock-flight__k">本月</span>
                  <span className="num">{formatAmount(goal.allocatedThisMonth)}</span>
                  <span className="num">{formatAmount(goal.monthlyPlan)}</span>
                  <TickMeter value={goal.allocatedThisMonth} max={goal.monthlyPlan} label="本月已分配" tone="primary" />
                </div>
              </div>
              <div className="fl-dock-flight__side">
                <dl className="fl-dock-flight__facts">
                  <div>
                    <dt>距{route.to.city}還差</dt>
                    <dd className="num">{formatAmount(gp.remaining)}</dd>
                  </div>
                  <div>
                    <dt>剩餘（含本月）</dt>
                    <dd className="num">{gp.periodsLeft} 期</dd>
                  </div>
                  <div>
                    <dt>每期需存</dt>
                    <dd className="num">{gp.perPeriodNeeded !== null ? formatAmount(gp.perPeriodNeeded) : '—'}</dd>
                  </div>
                  <div>
                    <dt>預計抵達</dt>
                    <dd className="num">{gp.projectedMonth ? formatYearMonth(gp.projectedMonth) : '—'}</dd>
                  </div>
                </dl>
                <Button variant="savings" size="md" fullWidth>
                  分配資金
                </Button>
              </div>
            </div>
          )}
          {tab === 'spend' && (
            <SpendingChart daily={demo.dailyVariableSpend} daysInMonth={demo.daysInMonth} month={demo.today.month} budget={demo.variableBudget} height={168} />
          )}
          {tab === 'category' && <CategoryBar items={demo.categorySpend} />}
          {tab === 'tx' && (
            <div className="fl-dock-list">
              <TransactionRow kind="expense" title="路易莎咖啡" date="今天" detail="餐飲" amount={135} autoCategorized />
              <TransactionRow kind="expense" title="台北捷運" date="10/13" detail="交通" amount={45} autoCategorized />
              <TransactionRow kind="expense" title="蝦皮購物" date="10/12" detail="購物" amount={680} />
              <TransactionRow kind="income" title="十月薪資" date="10/10" detail="收入 · 中信" amount={32000} glyph="薪" />
            </div>
          )}
          {tab === 'goals' && (
            <div className="fl-dock-goals">
              {others.map((g) => {
                const p = computeGoalProgress(g, demo.thisMonth);
                return (
                  <div key={g.name} className="fl-dock-goals__item">
                    <div className="fl-sub__row">
                      <span className="fl-strong">{g.name}</span>
                      <span className={`fl-dock-goals__status is-${p.status}`}>{statusText[p.status]}</span>
                    </div>
                    <TickMeter value={g.saved} max={g.target} label={`${g.name}進度`} />
                    <span className="num fl-sub__meta">
                      {formatAmount(g.saved)} / {formatAmount(g.target)} · {p.percentLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <nav aria-label="主選單" className="fl-app__tabbar">
        <a href="#" aria-current="page">
          總覽
        </a>
        <a href="#">交易</a>
        <a href="#" className="fl-app__fab" aria-label="記一筆">
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
