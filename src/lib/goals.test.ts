import { describe, expect, it } from 'vitest';
import { computeGoalProgress, type GoalInput } from './goals';

const oct2026 = { year: 2026, month: 10 };
const iceland: GoalInput = { target: 150000, saved: 45000, deadline: { year: 2027, month: 7 }, monthlyPlan: 10500 };

describe('computeGoalProgress — Iceland acceptance example', () => {
  it('matches the spec before the extra allocation', () => {
    const p = computeGoalProgress(iceland, oct2026);
    expect(p.percentLabel).toBe('30%');
    expect(p.remaining).toBe(105000);
    expect(p.periodsLeft).toBe(10); // Oct 2026 … Jul 2027, both included
    expect(p.perPeriodNeeded).toBe(10500);
    expect(p.status).toBe('on-track');
    expect(p.projectedMonth).toEqual({ year: 2027, month: 7 });
    expect(p.milestone).toBe(25);
  });

  it('matches the spec after allocating another 5,000', () => {
    const p = computeGoalProgress({ ...iceland, saved: 50000 }, oct2026);
    expect(p.percentLabel).toBe('33.3%');
    expect(p.remaining).toBe(100000);
  });
});

describe('computeGoalProgress — states', () => {
  it('reports behind with the extra monthly amount needed', () => {
    const p = computeGoalProgress({ target: 60000, saved: 18000, deadline: { year: 2027, month: 6 }, monthlyPlan: 2000 }, oct2026);
    expect(p.status).toBe('behind');
    expect(p.periodsLeft).toBe(9);
    expect(p.perPeriodNeeded).toBe(4667);
    expect(p.extraPerMonth).toBe(2667);
    expect(p.projectedMonth).toEqual({ year: 2028, month: 6 });
  });

  it('refuses to invent a date without a monthly plan', () => {
    const p = computeGoalProgress({ target: 15000, saved: 0, deadline: { year: 2027, month: 6 }, monthlyPlan: null }, oct2026);
    expect(p.status).toBe('no-plan');
    expect(p.projectedMonth).toBeNull();
  });

  it('flags an overdue goal', () => {
    const p = computeGoalProgress({ target: 10000, saved: 4000, deadline: { year: 2026, month: 9 }, monthlyPlan: 1000 }, oct2026);
    expect(p.status).toBe('overdue');
    expect(p.periodsLeft).toBe(0);
    expect(p.remaining).toBe(6000);
  });

  it('reports surplus when over-funded', () => {
    const p = computeGoalProgress({ target: 12000, saved: 13000, deadline: { year: 2026, month: 12 }, monthlyPlan: 2000 }, oct2026);
    expect(p.status).toBe('achieved');
    expect(p.surplus).toBe(1000);
    expect(p.percentValue).toBe(100);
    expect(p.milestone).toBe(100);
  });

  it('counts the deadline month itself as one period', () => {
    const p = computeGoalProgress({ target: 1000, saved: 0, deadline: oct2026, monthlyPlan: 1000 }, oct2026);
    expect(p.periodsLeft).toBe(1);
    expect(p.status).toBe('on-track');
  });
});
