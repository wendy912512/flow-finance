import { useMemo } from "react";
import { AccountWallet } from "../../components/AccountWallet/AccountWallet";
import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import { CategoryBar } from "../../components/CategoryBar/CategoryBar";
import { GoalGlobe } from "../../components/GoalGlobe/GoalGlobe";
import { NetWorthCard } from "../../components/NetWorthCard/NetWorthCard";
import { ProgressBar } from "../../components/ProgressBar/ProgressBar";
import { ProgressGauge } from "../../components/ProgressGauge/ProgressGauge";
import { SpendingChart } from "../../components/SpendingChart/SpendingChart";
import { TickMeter } from "../../components/TickMeter/TickMeter";
import { TransactionRow } from "../../components/TransactionRow/TransactionRow";
import * as demo from "../../demo/data";
import { computeGoalProgress, formatYearMonth } from "../../lib/goals";
import { formatAmount } from "../../lib/money";
import "./Overview.css";

export interface OverviewProps {
  animateIn?: boolean;
}

const nav = ["總覽", "交易", "薪水分配", "存錢目標", "帳戶", "設定"];
const statusText = {
  "on-track": "可如期",
  behind: "需要調整",
  "no-plan": "尚無法推估",
  overdue: "已過預計日期",
  achieved: "已達標",
} as const;

/** How many upcoming payments the sub-card lists before collapsing the rest into a "還有 N 筆" link. */
const PENDING_SHOWN = 3;

/**
 * 總覽: the 3D globe is a fixed backdrop for the whole page.
 * Left: an off-white panel whose top (today's number) stays pinned while the cards under it scroll.
 * Right: translucent cards on the scene — goal + other goals top-right, this month's analysis along the bottom,
 * and recent transactions in their own block below the first screen.
 * Every figure is computed from `demo/data.ts`.
 */
export function Overview({ animateIn = true }: OverviewProps) {
  const variableSpent = demo.dailyVariableSpend.reduce((s, v) => s + v, 0);
  const fixedPaid = 3300;
  const pending = [
    { day: 18, name: "Spotify", amount: 149 },
    { day: 20, name: "電信費", amount: 599 },
    { day: 25, name: "筆電 2/6", amount: 3334 },
    { day: 28, name: "健身房", amount: 1288 },
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
  const limitedBy =
    budgetLeft <= fundsAfterPending ? "預算剩餘" : "日常資金扣待支付";

  const goal = demo.iceland;
  const gp = computeGoalProgress(goal, demo.thisMonth);
  const ratio = Math.min(1, goal.saved / goal.target);
  const others = [
    {
      name: "緊急預備金",
      target: 60000,
      saved: 18000,
      deadline: { year: 2027, month: 6 },
      monthlyPlan: 2000,
    },
    {
      name: "考多益課程",
      target: 12000,
      saved: 7200,
      deadline: { year: 2026, month: 12 },
      monthlyPlan: 2000,
    },
    {
      name: "露營裝備",
      target: 15000,
      saved: 0,
      deadline: { year: 2027, month: 6 },
      monthlyPlan: null,
    },
  ];
  const route = useMemo(() => goal.route, [goal.route]);
  const view = useMemo(
    () => ({ latShift: -26, lngShift: 6, altitude: 2.3 }),
    [],
  );

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
          scrollZoom="modifier"
          ariaLabel={`${goal.name}：從${route.from.city}飛往${route.to.city}，已存 ${gp.percentLabel}`}
        />
      </div>

      {/* ── Left panel ── */}
      <aside className="fl-app__panel" aria-label="每日資訊">
        <div className="fl-app__pin">
          <header className="fl-app__brand">
            <div className="fl-app__logo">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="1"
                  width="30"
                  height="30"
                  rx="8"
                  fill="var(--primary)"
                />
                <path
                  d="M8 20 L13.5 14.5 L18 18 L24 11"
                  fill="none"
                  stroke="var(--on-primary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>流向</span>
            </div>
            <Button size="md" className="fl-app__add">
              ＋ 記一筆
            </Button>
          </header>

          <div className="fl-app__title">
            <div className="fl-app__eyebrow">
              <span className="num">{demo.today.year}</span> 年{" "}
              <span className="num">{demo.today.month}</span> 月 · 本月剩{" "}
              <span className="num">{daysLeft}</span> 天（含今天）
            </div>
            <div className="fl-app__hero">
              <span className="fl-app__cur">NT$</span>
              <span className="text-display-1">{formatAmount(perDay)}</span>
            </div>
            <div className="fl-app__hero-label">
              今天建議可花 · 可自由花費{" "}
              <span className="num fl-strong">{formatAmount(spendable)}</span> ÷{" "}
              {daysLeft} 天
            </div>
          </div>
        </div>

        <div className="fl-app__panel-body">
          <div className="fl-sub-grid">
            <section className="fl-sub" aria-label="日常預算">
              <div className="fl-sub__head">日常預算剩餘</div>
              <div className="fl-sub__value num">
                {formatAmount(budgetLeft)}
              </div>
              <div className="fl-sub__meta">
                已用 <span className="num">{formatAmount(variableSpent)}</span>{" "}
                /{" "}
                <span className="num">{formatAmount(demo.variableBudget)}</span>
              </div>
              <ProgressBar
                value={variableSpent}
                max={demo.variableBudget}
                label="日常預算已用"
              />
            </section>
            <section className="fl-sub" aria-label="待支付">
              <div className="fl-sub__head">本月待支付</div>
              <div className="fl-sub__value num">
                {formatAmount(pendingTotal)}
              </div>
              <ul className="fl-sub__list">
                {pendingShown.map((p) => (
                  <li key={p.name}>
                    <span>
                      <span className="num">10/{p.day}</span> {p.name}
                    </span>
                    <span className="num">{formatAmount(p.amount)}</span>
                  </li>
                ))}
              </ul>
              {pendingMore.length > 0 && (
                <a href="#" className="fl-link fl-sub__more">
                  還有 <span className="num">{pendingMore.length}</span> 筆 ·{" "}
                  <span className="num">
                    {formatAmount(
                      pendingMore.reduce((t, p) => t + p.amount, 0),
                    )}
                  </span>{" "}
                  →
                </a>
              )}
            </section>
            <section className="fl-sub" aria-label="本月收入">
              <div className="fl-sub__head">本月收入</div>
              <div className="fl-sub__value num">
                {formatAmount(demo.income.salary + demo.income.other)}
              </div>
              <div className="fl-sub__meta">
                薪資{" "}
                <span className="num">{formatAmount(demo.income.salary)}</span>{" "}
                · 其他{" "}
                <span className="num">{formatAmount(demo.income.other)}</span>
              </div>
            </section>
            <section className="fl-sub" aria-label="本月支出">
              <div className="fl-sub__head">本月支出</div>
              <div className="fl-sub__value num">
                {formatAmount(variableSpent + fixedPaid)}
              </div>
              <div className="fl-sub__meta">
                日常 <span className="num">{formatAmount(variableSpent)}</span>{" "}
                · 固定 <span className="num">{formatAmount(fixedPaid)}</span>
              </div>
            </section>
          </div>

          <details className="fl-sub fl-sub--how">
            <summary>今天建議可花怎麼算的？</summary>
            <dl>
              <div>
                <dt>① 預算剩餘</dt>
                <dd className="num">
                  {formatAmount(demo.variableBudget)} −{" "}
                  {formatAmount(variableSpent)} = {formatAmount(budgetLeft)}
                </dd>
              </div>
              <div>
                <dt>② 日常資金扣掉待支付</dt>
                <dd className="num">
                  {formatAmount(dailyFunds)} − {formatAmount(pendingTotal)} ={" "}
                  {formatAmount(fundsAfterPending)}
                </dd>
              </div>
              <div>
                <dt>取較小的（{limitedBy}）÷ 剩餘天數</dt>
                <dd className="num">
                  {formatAmount(spendable)} ÷ {daysLeft} ={" "}
                  {formatAmount(perDay)}
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
                {
                  id: "ctbc",
                  ...demo.accounts.ctbc,
                  available:
                    demo.accounts.ctbc.balance - demo.accounts.ctbc.reserved,
                },
                {
                  id: "yuanta",
                  ...demo.accounts.yuanta,
                  face: "graphite",
                  balanceLabel: "現金餘額",
                  footnote: "不含 ETF 市值",
                },
                { id: "cathay", ...demo.accounts.cathay, status: "planned" },
              ]}
            />
          </section>

          <NetWorthCard
            bare
            deposits={demo.depositTotal}
            investmentValue={demo.investmentMarketValue}
            creditCardUnpaid={demo.creditCardUnpaid}
          />
        </div>
      </aside>

      {/* ── Everything on the scene ── */}
      <main className="fl-app__main">
        <div className="fl-app__grid">
          <div className="fl-app__top">
            <nav aria-label="主選單" className="fl-app__nav">
              {nav.map((n, i) => (
                <a key={n} href="#" aria-current={i === 0 ? "page" : undefined}>
                  {n}
                </a>
              ))}
            </nav>
            <div className="fl-app__month">
              <button type="button" aria-label="上個月">
                ‹
              </button>
              <span>
                <span className="num">{demo.today.year}</span> 年{" "}
                <span className="num">{demo.today.month}</span> 月
              </span>
              <button type="button" aria-label="下個月">
                ›
              </button>
            </div>
          </div>

          <div className="fl-app__right">
            <section className="fl-glass fl-goal" aria-labelledby="goal-title">
              <div className="fl-glass__eyebrow">優先目標</div>
              <div className="fl-goal__head">
                <h2 id="goal-title" className="fl-goal__name">
                  {goal.name}
                </h2>
                <Badge
                  tone={
                    gp.status === "behind" || gp.status === "overdue"
                      ? "warning"
                      : "savings"
                  }
                >
                  {statusText[gp.status]}
                </Badge>
              </div>
              <p className="fl-goal__purpose">{goal.purpose}</p>

              <div className="fl-goal__summary">
                <ProgressGauge
                  value={ratio}
                  label={gp.percentLabel}
                  caption="已存比例"
                  size={112}
                />
                <dl className="fl-goal__facts">
                  <div>
                    <dt>距目標還差</dt>
                    <dd className="num">{formatAmount(gp.remaining)}</dd>
                  </div>
                  <div>
                    <dt>剩餘（含本月）</dt>
                    <dd className="num">{gp.periodsLeft} 期</dd>
                  </div>
                  <div>
                    <dt>每期需存</dt>
                    <dd className="num">
                      {gp.perPeriodNeeded !== null
                        ? formatAmount(gp.perPeriodNeeded)
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt>預計抵達</dt>
                    <dd className="num">
                      {gp.projectedMonth
                        ? formatYearMonth(gp.projectedMonth)
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="fl-goal__meter">
                <div className="fl-goal__meter-row">
                  <span>總進度</span>
                  <span className="num">
                    <b>{formatAmount(goal.saved)}</b> /{" "}
                    {formatAmount(goal.target)}
                  </span>
                </div>
                <TickMeter
                  value={goal.saved}
                  max={goal.target}
                  label={`${goal.name}總進度`}
                  marks={[25, 50, 75]}
                />
              </div>
              <div className="fl-goal__meter">
                <div className="fl-goal__meter-row">
                  <span>本月已分配</span>
                  <span className="num">
                    <b>{formatAmount(goal.allocatedThisMonth)}</b> /{" "}
                    {formatAmount(goal.monthlyPlan)}
                  </span>
                </div>
                <TickMeter
                  value={goal.allocatedThisMonth}
                  max={goal.monthlyPlan}
                  label="本月已分配"
                  tone="primary"
                />
              </div>
              <Button variant="savings" size="md" fullWidth>
                分配資金
              </Button>
            </section>

            <section
              className="fl-glass fl-others"
              aria-labelledby="others-title"
            >
              <div className="fl-glass__head">
                <h2 id="others-title" className="fl-glass__title">
                  其他目標
                </h2>
                <a href="#" className="fl-link">
                  全部 →
                </a>
              </div>
              <ul className="fl-others__list">
                {others.map((g) => {
                  const p = computeGoalProgress(g, demo.thisMonth);
                  return (
                    <li key={g.name}>
                      <div className="fl-others__row">
                        <span className="fl-strong">{g.name}</span>
                        <span className={`fl-others__status is-${p.status}`}>
                          {statusText[p.status]}
                        </span>
                      </div>
                      <TickMeter
                        value={g.saved}
                        max={g.target}
                        label={`${g.name}進度`}
                      />
                      <span className="num fl-others__meta">
                        {formatAmount(g.saved)} / {formatAmount(g.target)} ·{" "}
                        {p.percentLabel}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <div className="fl-app__left">
            <div className="fl-app__spacer" aria-hidden="true" />
            <div className="fl-app__bottom">
              <section className="fl-glass" aria-labelledby="spend-title">
                <div className="fl-glass__head">
                  <h2 id="spend-title" className="fl-glass__title">
                    本月日常支出（累計）
                  </h2>
                  <span className="fl-glass__meta num">
                    {formatAmount(variableSpent)} /{" "}
                    {formatAmount(demo.variableBudget)}
                  </span>
                </div>
                <SpendingChart
                  daily={demo.dailyVariableSpend}
                  daysInMonth={demo.daysInMonth}
                  month={demo.today.month}
                  budget={demo.variableBudget}
                  height={164}
                />
              </section>
              <section className="fl-glass" aria-labelledby="cat-title">
                <div className="fl-glass__head">
                  <h2 id="cat-title" className="fl-glass__title">
                    支出類別
                  </h2>
                </div>
                <CategoryBar items={demo.categorySpend} />
              </section>
            </div>
            <section className="fl-glass fl-app__tx" aria-labelledby="tx-title">
              <div className="fl-glass__head">
                <h2 id="tx-title" className="fl-glass__title">
                  最近交易
                </h2>
                <a href="#" className="fl-link">
                  全部交易 →
                </a>
              </div>
              <div className="fl-app__tx-list">
                <TransactionRow
                  kind="expense"
                  title="路易莎咖啡"
                  date="今天"
                  detail="餐飲"
                  amount={135}
                  autoCategorized
                />
                <TransactionRow
                  kind="expense"
                  title="全家便利商店"
                  date="今天"
                  detail="餐飲"
                  amount={89}
                  autoCategorized
                />
                <TransactionRow
                  kind="expense"
                  title="台北捷運"
                  date="10/13"
                  detail="交通"
                  amount={45}
                  autoCategorized
                />
                <TransactionRow
                  kind="expense"
                  title="蝦皮購物"
                  date="10/12"
                  detail="購物"
                  amount={680}
                />
                <TransactionRow
                  kind="expense"
                  title="麥當勞"
                  date="10/11"
                  detail="餐飲"
                  amount={158}
                  autoCategorized
                />
                <TransactionRow
                  kind="income"
                  title="十月薪資"
                  date="10/10"
                  detail="收入 · 中信"
                  amount={32000}
                  glyph="薪"
                />
              </div>
            </section>
          </div>
        </div>
      </main>

      <nav aria-label="主選單" className="fl-app__tabbar">
        <a href="#" aria-current="page">
          總覽
        </a>
        <a href="#">交易</a>
        <a href="#" className="fl-app__fab" aria-label="記一筆">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </a>
        <a href="#">目標</a>
        <a href="#">更多</a>
      </nav>
    </div>
  );
}
