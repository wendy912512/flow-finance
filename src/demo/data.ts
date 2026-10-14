/**
 * Demo data for Storybook and demo mode. Not real financial data.
 * Every figure here is internally consistent: totals are computed, not typed.
 */
import type { YearMonth } from '../lib/goals';

export const today = { year: 2026, month: 10, day: 14 };
export const thisMonth: YearMonth = { year: 2026, month: 10 };
export const daysInMonth = 31;

export const accounts = {
  ctbc: { bankName: '中國信託', roleLabel: '薪資入帳 · 日常暫代', balance: 92450, reserved: 83000, last4: '2048' },
  cathay: { bankName: '國泰世華', roleLabel: '日常花費（預定）' },
  yuanta: { bankName: '元大銀行', roleLabel: '投資 · 交割現金', balance: 20000, last4: '7731' },
} as const;

export const depositTotal = accounts.ctbc.balance + accounts.yuanta.balance;
export const creditCardUnpaid = 0;
/** Manually entered market value of holdings; null when not entered yet. */
export const investmentMarketValue: number | null = null;

export const iceland = {
  name: '畢業去冰島',
  purpose: '想在畢業後送自己一趟旅行，親眼看極光與冰川。',
  target: 150000,
  saved: 45000,
  deadline: { year: 2027, month: 7 },
  monthlyPlan: 10500,
  allocatedThisMonth: 0,
  priority: 1,
  accountName: '中信',
  route: {
    from: { code: 'TPE', city: '台北', lat: 25.0797, lng: 121.2342 },
    to: { code: 'KEF', city: '雷克雅維克', lat: 63.985, lng: -22.6056 },
  },
};

/** Variable (budgeted) spending per day of October, in whole dollars. Index 0 = Oct 1. */
export const dailyVariableSpend = [320, 290, 290, 550, 530, 420, 720, 480, 450, 850, 720, 1360, 440, 820];
export const variableBudget = 15000;

export const categorySpend = [
  { key: 'food', name: '餐飲', amount: 4120 },
  { key: 'housing', name: '居住', amount: 3000 },
  { key: 'transport', name: '交通', amount: 1280 },
  { key: 'shopping', name: '購物', amount: 1560 },
  { key: 'fun', name: '娛樂', amount: 860 },
  { key: 'learning', name: '學習', amount: 420 },
  { key: 'subscription', name: '訂閱', amount: 300 },
];

export const income = { salary: 32000, other: 500 };
