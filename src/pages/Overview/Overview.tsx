import { useMemo } from 'react';
import { Badge } from '../../components/Badge/Badge';
import { Button } from '../../components/Button/Button';
import { CategoryBar } from '../../components/CategoryBar/CategoryBar';
import { GoalGlobe } from '../../components/GoalGlobe/GoalGlobe';
import { ProgressGauge } from '../../components/ProgressGauge/ProgressGauge';
import { SpendingChart } from '../../components/SpendingChart/SpendingChart';
import { TickMeter } from '../../components/TickMeter/TickMeter';
import * as demo from '../../demo/data';
import { computeGoalProgress, formatYearMonth } from '../../lib/goals';
import { formatAmount } from '../../lib/money';
import { AppShell, type PageId } from '../AppShell/AppShell';
import './Overview.css';

export interface OverviewProps {
  animateIn?: boolean;
  onNavigate?: (page: PageId) => void;
}

const statusText = { 'on-track': '可如期', behind: '需要調整', 'no-plan': '尚無法推估', overdue: '已過預計日期', achieved: '已達標' } as const;
const MILESTONES = [25, 50, 75];

/**
 * 總覽: the 3D flight to the priority goal (goal details top-right, other goals under it,
 * overall progress under the globe), then this month's spending chart and categories.
 * Transactions live on the 交易 page.
 */
export function Overview({ animateIn = true, onNavigate }: OverviewProps) {
  const goal = demo.iceland;
  const gp = computeGoalProgress(goal, demo.thisMonth);
  const ratio = Math.min(1, goal.saved / goal.target);
  const variableSpent = demo.dailyVariableSpend.reduce((s, v) => s + v, 0);
  const others = [
    { name: '緊急預備金', target: 60000, saved: 18000, deadline: { year: 2027, month: 6 }, monthlyPlan: 2000 },
    { name: '考多益課程', target: 12000, saved: 7200, deadline: { year: 2026, month: 12 }, monthlyPlan: 2000 },
    { name: '露營裝備', target: 15000, saved: 0, deadline: { year: 2027, month: 6 }, monthlyPlan: null },
  ];
  const route = useMemo(() => goal.route, [goal.route]);
  const view = useMemo(() => ({ latShift: -18, lngShift: 6, altitude: 2.3 }), []);

  return (
    <AppShell active="overview" onNavigate={onNavigate}>
      <section className="ov-scene" aria-label={`優先目標：${goal.name}`}>
        <div className="ov-scene__globe">
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

        <div className="fl-glass ov-track">
          <div className="ov-track__head">
            <span className="fl-strong">總進度</span>
            <span className="num">
              <b>{formatAmount(goal.saved)}</b> / {formatAmount(goal.target)} · {gp.percentLabel}
            </span>
          </div>
          <TickMeter value={goal.saved} max={goal.target} label={`${goal.name}總進度`} marks={MILESTONES} />
          <div className="ov-track__ends">
            <span>
              <b>{route.from.code}</b> {route.from.city}
            </span>
            <span>里程碑 {MILESTONES.map((m) => `${m}%`).join(' · ')}</span>
            <span>
              <b>{route.to.code}</b> {route.to.city}
            </span>
          </div>
        </div>

        <div className="ov-scene__side">
          <section className="fl-glass ov-goal" aria-labelledby="goal-title">
            <div className="fl-glass__eyebrow">優先目標</div>
            <div className="ov-goal__head">
              <h2 id="goal-title" className="ov-goal__name">
                {goal.name}
              </h2>
              <Badge tone={gp.status === 'behind' || gp.status === 'overdue' ? 'warning' : 'savings'}>{statusText[gp.status]}</Badge>
            </div>
            <p className="ov-goal__purpose">{goal.purpose}</p>

            <div className="ov-goal__summary">
              <ProgressGauge value={ratio} label={gp.percentLabel} caption="已存比例" size={112} />
              <dl className="ov-goal__facts">
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
                  <dd className="num">{gp.perPeriodNeeded !== null ? formatAmount(gp.perPeriodNeeded) : '—'}</dd>
                </div>
                <div>
                  <dt>預計抵達</dt>
                  <dd className="num">{gp.projectedMonth ? formatYearMonth(gp.projectedMonth) : '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="ov-goal__meter">
              <div className="ov-goal__meter-row">
                <span>本月已分配</span>
                <span className="num">
                  <b>{formatAmount(goal.allocatedThisMonth)}</b> / {formatAmount(goal.monthlyPlan)}
                </span>
              </div>
              <TickMeter value={goal.allocatedThisMonth} max={goal.monthlyPlan} label="本月已分配" tone="primary" />
            </div>
            <Button variant="savings" size="md" fullWidth>
              分配資金
            </Button>
          </section>

          <section className="fl-glass ov-others" aria-labelledby="others-title">
            <div className="fl-glass__head">
              <h2 id="others-title" className="fl-glass__title">
                其他目標
              </h2>
              <a
                href="#"
                className="fl-link"
                onClick={(e) => {
                  if (!onNavigate) return;
                  e.preventDefault();
                  onNavigate('goals');
                }}
              >
                全部 →
              </a>
            </div>
            <ul className="ov-others__list">
              {others.map((g) => {
                const p = computeGoalProgress(g, demo.thisMonth);
                return (
                  <li key={g.name}>
                    <div className="ov-others__row">
                      <span className="fl-strong">{g.name}</span>
                      <span className={`ov-others__status is-${p.status}`}>{statusText[p.status]}</span>
                    </div>
                    <TickMeter value={g.saved} max={g.target} label={`${g.name}進度`} />
                    <span className="num ov-others__meta">
                      {formatAmount(g.saved)} / {formatAmount(g.target)} · {p.percentLabel}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </section>

      <div className="ov-analysis">
        <section className="fl-glass" aria-labelledby="spend-title">
          <div className="fl-glass__head">
            <h2 id="spend-title" className="fl-glass__title">
              本月日常支出（累計）
            </h2>
            <span className="fl-glass__meta num">
              {formatAmount(variableSpent)} / {formatAmount(demo.variableBudget)}
            </span>
          </div>
          <SpendingChart daily={demo.dailyVariableSpend} daysInMonth={demo.daysInMonth} month={demo.today.month} budget={demo.variableBudget} height={200} />
        </section>
        <section className="fl-glass" aria-labelledby="cat-title">
          <div className="fl-glass__head">
            <h2 id="cat-title" className="fl-glass__title">
              支出類別
            </h2>
            <span className="fl-glass__meta num">合計 {formatAmount(demo.categorySpend.reduce((s, c) => s + c.amount, 0))}</span>
          </div>
          <CategoryBar items={demo.categorySpend} />
        </section>
      </div>
    </AppShell>
  );
}
