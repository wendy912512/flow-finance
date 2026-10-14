import { computeGoalProgress, formatYearMonth, type GoalInput, type YearMonth } from '../../lib/goals';
import { formatAmount } from '../../lib/money';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { GoalGlobe, type GeoPlace } from '../GoalGlobe/GoalGlobe';
import './FlightGoalHero.css';

export interface FlightGoalHeroProps extends GoalInput {
  name: string;
  purpose: string;
  priority?: number;
  route: { from: GeoPlace; to: GeoPlace };
  allocatedThisMonth?: number;
  today: YearMonth;
  animateIn?: boolean;
  onAllocate?: () => void;
}

/** The overview's main visual for a travel goal: a 3D globe flight plus the goal's numbers. */
export function FlightGoalHero({ name, purpose, priority, route, allocatedThisMonth = 0, today, animateIn = true, onAllocate, ...goal }: FlightGoalHeroProps) {
  const p = computeGoalProgress(goal, today);
  const ratio = goal.target > 0 ? Math.min(1, goal.saved / goal.target) : 0;

  const status = {
    achieved: <Badge tone="savings">已抵達</Badge>,
    'on-track': <Badge tone="savings">可如期抵達</Badge>,
    behind: <Badge tone="warning">需要調整</Badge>,
    'no-plan': <Badge tone="neutral">尚無法推估</Badge>,
    overdue: <Badge tone="warning">已過預計日期</Badge>,
  }[p.status];

  return (
    <Card as="section" surface="glass" padding="lg" className="fl-flight" aria-label={`存錢目標：${name}`}>
      <header className="fl-flight__head">
        <div className="fl-flight__eyebrow">
          {priority !== undefined && <span className="fl-flight__chip">優先 {priority}</span>}
          存錢目標 · 飛航進度
        </div>
        <h2 className="fl-flight__name">{name}</h2>
        <p className="fl-flight__purpose">{purpose}</p>
      </header>

      <div className="fl-flight__stage">
        <GoalGlobe
          from={route.from}
          to={route.to}
          progress={ratio}
          progressLabel={`已存 ${p.percentLabel}`}
          animateIn={animateIn}
          ariaLabel={`${name}：從${route.from.city}飛往${route.to.city}，已存 ${p.percentLabel}`}
        />
      </div>

      <Card as="aside" surface="glass-strong" padding="md" className="fl-flight__panel" aria-label="航班資訊">
        <div className="fl-flight__row">
          <span className="fl-flight__label">航班資訊</span>
          {status}
        </div>
        <div>
          <div className="fl-flight__label">已存</div>
          <div className="text-display-2">
            {formatAmount(goal.saved)}
            <span className="fl-flight__of num"> / {formatAmount(goal.target)}</span>
          </div>
        </div>
        <dl className="fl-flight__grid">
          <div>
            <dt>距{route.to.city}還差</dt>
            <dd className="text-amount-md">{formatAmount(p.remaining)}</dd>
          </div>
          <div>
            <dt>剩餘期數（含本月）</dt>
            <dd className="text-amount-md">{p.periodsLeft} 期</dd>
          </div>
          <div>
            <dt>每期需存</dt>
            <dd className="text-amount-md">{p.perPeriodNeeded !== null ? formatAmount(p.perPeriodNeeded) : '—'}</dd>
          </div>
          <div>
            <dt>{p.projectedMonth ? '預計抵達' : '目標月份'}</dt>
            <dd className="text-amount-md">{formatYearMonth(p.projectedMonth ?? goal.deadline)}</dd>
          </div>
        </dl>
        <div className="fl-flight__label">
          本月已分配 <span className="num fl-flight__strong">{formatAmount(allocatedThisMonth)}</span> / 計畫 <span className="num">{formatAmount(goal.monthlyPlan ?? 0)}</span>
        </div>
        <Button variant="savings" fullWidth onClick={onAllocate}>
          分配資金
        </Button>
      </Card>

      <div className="fl-flight__track">
        <div className="fl-flight__row fl-flight__label">
          <span>
            已存 <span className="num fl-flight__strong">{formatAmount(goal.saved)}</span> / {formatAmount(goal.target)}（{p.percentLabel}）
          </span>
          <span>里程碑 25% · 50% · 75%</span>
        </div>
        <div
          className="fl-flight__ticks"
          role="progressbar"
          aria-label={`${name}進度`}
          aria-valuemin={0}
          aria-valuemax={goal.target}
          aria-valuenow={goal.saved}
          aria-valuetext={`已存 ${formatAmount(goal.saved)} 元，${p.percentLabel}`}
        >
          <div className="fl-flight__ticks-fill" style={{ width: `${ratio * 100}%` }} />
          {[25, 50, 75].map((m) => (
            <span key={m} className={`fl-flight__milestone${p.milestone >= m ? ' is-done' : ''}`} style={{ left: `${m}%` }} />
          ))}
        </div>
      </div>
    </Card>
  );
}
