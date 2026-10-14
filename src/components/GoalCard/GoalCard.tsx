import { computeGoalProgress, formatYearMonth, type GoalInput, type YearMonth } from '../../lib/goals';
import { formatAmount } from '../../lib/money';
import { Amount } from '../Amount/Amount';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { ProgressBar } from '../ProgressBar/ProgressBar';
import './GoalCard.css';

export interface GoalCardProps extends GoalInput {
  name: string;
  /** Why this goal matters. Always shown — never hidden in the edit form. */
  purpose: string;
  priority?: number;
  accountName?: string;
  /** Amount allocated to this goal in the current month. */
  allocatedThisMonth?: number;
  /** The month to calculate from (Asia/Taipei). */
  today: YearMonth;
  onAllocate?: () => void;
  onSetPlan?: () => void;
}

const milestoneText: Record<number, string> = {
  25: '踏出第一段了，已存到四分之一。',
  50: '走到一半了，剩下的路比走過的短。',
  75: '只剩最後四分之一，終點看得見了。',
  100: '目標達成！這筆錢已經準備好了。',
};

export function GoalCard({ name, purpose, priority, accountName, allocatedThisMonth = 0, today, onAllocate, onSetPlan, ...goal }: GoalCardProps) {
  const p = computeGoalProgress(goal, today);
  const deadline = formatYearMonth(goal.deadline);

  const status = {
    achieved: <Badge tone="savings">已達標</Badge>,
    'on-track': <Badge tone="savings">可如期</Badge>,
    behind: <Badge tone="warning">需要調整</Badge>,
    'no-plan': <Badge tone="neutral">尚無法推估</Badge>,
    overdue: <Badge tone="warning">已過預計日期</Badge>,
  }[p.status];

  return (
    <Card as="article" className="fl-goal" aria-label={`存錢目標：${name}`}>
      <div className="fl-goal__row">
        <span className="fl-goal__eyebrow">
          {priority !== undefined && `優先 ${priority}`}
          {priority !== undefined && accountName && ' · '}
          {accountName}
        </span>
        {status}
      </div>

      <div>
        <h3 className="fl-goal__name">{name}</h3>
        <p className="fl-goal__purpose">{purpose}</p>
      </div>

      <div className="fl-goal__row">
        <span>
          <Amount value={goal.saved} size="lg" />
          <span className="fl-goal__of num"> / {formatAmount(goal.target)}</span>
        </span>
        <span className="text-amount-lg fl-goal__pct">{p.percentLabel}</span>
      </div>

      <ProgressBar value={goal.saved} max={goal.target} tone="savings" size="lg" milestones label={`${name}進度`} />

      {p.status === 'achieved' ? (
        <p className="fl-goal__callout fl-goal__callout--savings">
          {p.surplus > 0 ? `已超過目標 ${formatAmount(p.surplus)}，可以解除多餘的預留。` : milestoneText[100]}
        </p>
      ) : (
        <dl className="fl-goal__grid">
          <div>
            <dt>還差</dt>
            <dd className="text-amount-md">{formatAmount(p.remaining)}</dd>
          </div>
          <div>
            <dt>剩餘（含本月）</dt>
            <dd className="text-amount-md">{p.periodsLeft} 期</dd>
          </div>
          <div>
            <dt>每期需存</dt>
            <dd className="text-amount-md">{p.perPeriodNeeded !== null ? formatAmount(p.perPeriodNeeded) : '—'}</dd>
          </div>
        </dl>
      )}

      {p.status === 'behind' && p.projectedMonth && (
        <div className="fl-goal__callout">
          照目前每月 {formatAmount(goal.monthlyPlan ?? 0)}，預計 {formatYearMonth(p.projectedMonth)} 達成。想如期完成，可以：
          <ul>
            <li>每月多存 <span className="num">{formatAmount(p.extraPerMonth ?? 0)}</span></li>
            <li>或把期限調到 <span className="num">{formatYearMonth(p.projectedMonth)}</span></li>
          </ul>
        </div>
      )}
      {p.status === 'overdue' && (
        <div className="fl-goal__callout">原定 {deadline} 已過，還差 {formatAmount(p.remaining)}。可以延長期限，或封存這個目標。</div>
      )}
      {p.status !== 'achieved' && p.status !== 'behind' && p.milestone > 0 && p.milestone < 100 && (
        <p className="fl-goal__callout fl-goal__callout--savings">{milestoneText[p.milestone]}</p>
      )}

      <div className="fl-goal__foot">
        <span>
          {p.status === 'on-track' && p.projectedMonth && <>預計 <span className="num">{formatYearMonth(p.projectedMonth)}</span> 達成 · </>}
          {p.status === 'no-plan' ? '尚未設定每月存入，暫時無法推估' : (
            <>本月 <span className="num">{formatAmount(allocatedThisMonth)} / {formatAmount(goal.monthlyPlan ?? 0)}</span></>
          )}
        </span>
        {p.status === 'no-plan' ? (
          <Button variant="secondary" size="sm" onClick={onSetPlan}>設定每月存入</Button>
        ) : p.status !== 'achieved' ? (
          <Button variant="savings" size="sm" onClick={onAllocate}>分配資金</Button>
        ) : null}
      </div>
    </Card>
  );
}
