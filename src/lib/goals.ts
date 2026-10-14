import { formatPercent } from './money';

/**
 * Savings-goal calculations. Pure functions so they can be unit-tested and
 * reused by both components and the app's data layer.
 *
 * A "period" is one calendar month. Periods left INCLUDES the current month and
 * the deadline month: in Oct 2026 with a deadline of Jul 2027 there are 10.
 */

export interface YearMonth {
  year: number;
  /** 1–12 */
  month: number;
}

export interface GoalInput {
  target: number;
  /** Sum of allocation records for this goal (never the planned amount). */
  saved: number;
  deadline: YearMonth;
  /** User's planned monthly deposit; null when not set. */
  monthlyPlan: number | null;
}

export type GoalStatus = 'achieved' | 'overdue' | 'on-track' | 'behind' | 'no-plan';

export interface GoalProgress {
  status: GoalStatus;
  remaining: number;
  /** Amount saved above the target (only when achieved). */
  surplus: number;
  percentLabel: string;
  /** 0–100, clamped, for progress bars. */
  percentValue: number;
  /** Months from current month to deadline, inclusive. 0 when the deadline has passed. */
  periodsLeft: number;
  /** ceil(remaining / periodsLeft); null when overdue or achieved. */
  perPeriodNeeded: number | null;
  /** Month the plan reaches the target; null without a plan. */
  projectedMonth: YearMonth | null;
  /** Extra per month needed to finish on time when behind. */
  extraPerMonth: number | null;
  /** Highest milestone reached: 0, 25, 50, 75 or 100. */
  milestone: 0 | 25 | 50 | 75 | 100;
}


export const monthIndex = ({ year, month }: YearMonth): number => year * 12 + (month - 1);
export const fromIndex = (i: number): YearMonth => ({ year: Math.floor(i / 12), month: (i % 12) + 1 });
export const formatYearMonth = ({ year, month }: YearMonth): string => `${year}/${String(month).padStart(2, '0')}`;

const ceilDiv = (a: number, b: number): number => Math.floor((a + b - 1) / b);

export function computeGoalProgress(goal: GoalInput, today: YearMonth): GoalProgress {
  const { target, saved, deadline, monthlyPlan } = goal;
  const remaining = Math.max(0, target - saved);
  const surplus = Math.max(0, saved - target);
  const percentValue = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const percentLabel = formatPercent(saved, target);
  const milestone: GoalProgress['milestone'] = ([100, 75, 50, 25] as const).find((m) => saved * 100 >= target * m) ?? 0;

  const periodsLeft = Math.max(0, monthIndex(deadline) - monthIndex(today) + 1);
  const base = { remaining, surplus, percentLabel, percentValue, periodsLeft, milestone };

  if (remaining === 0) {
    return { ...base, status: 'achieved', perPeriodNeeded: null, projectedMonth: null, extraPerMonth: null };
  }

  const perPeriodNeeded = periodsLeft > 0 ? ceilDiv(remaining, periodsLeft) : null;

  let projectedMonth: YearMonth | null = null;
  if (monthlyPlan && monthlyPlan > 0) {
    const monthsNeeded = ceilDiv(remaining, monthlyPlan);
    projectedMonth = fromIndex(monthIndex(today) + monthsNeeded - 1);
  }

  if (periodsLeft === 0) {
    return { ...base, status: 'overdue', perPeriodNeeded: null, projectedMonth, extraPerMonth: null };
  }
  if (!projectedMonth || !monthlyPlan) {
    return { ...base, status: 'no-plan', perPeriodNeeded, projectedMonth: null, extraPerMonth: null };
  }
  const onTrack = monthIndex(projectedMonth) <= monthIndex(deadline);
  return {
    ...base,
    status: onTrack ? 'on-track' : 'behind',
    perPeriodNeeded,
    projectedMonth,
    extraPerMonth: onTrack ? null : (perPeriodNeeded ?? 0) - monthlyPlan,
  };
}
