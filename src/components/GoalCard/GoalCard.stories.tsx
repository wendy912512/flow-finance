import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { GoalCard } from './GoalCard';

const today = { year: 2026, month: 10 };

const meta = {
  title: '元件/GoalCard 存錢目標卡',
  component: GoalCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '進度、期數與推估全部由 `computeGoalProgress` 計算。剩餘期數含本月與目標月；推估只看每月預計存入，不假設投資收益。',
      },
    },
  },
  args: {
    name: '畢業去冰島',
    purpose: '想在畢業後送自己一趟旅行，親眼看極光與冰川。',
    target: 150000,
    saved: 45000,
    deadline: { year: 2027, month: 7 },
    monthlyPlan: 10500,
    allocatedThisMonth: 0,
    priority: 1,
    accountName: '中信',
    today,
    onAllocate: fn(),
    onSetPlan: fn(),
  },
  decorators: [(Story) => <div style={{ maxWidth: 440 }}><Story /></div>],
} satisfies Meta<typeof GoalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnTrack: Story = { name: '可如期（冰島 30%）' };

export const AfterAllocation: Story = { name: '再分配 5,000 後（33.3%）', args: { saved: 50000, allocatedThisMonth: 5000 } };

export const Behind: Story = {
  name: '需要調整',
  args: {
    name: '緊急預備金',
    purpose: '讓突發狀況不會打亂生活，目標存到半年生活費。',
    target: 60000,
    saved: 18000,
    deadline: { year: 2027, month: 6 },
    monthlyPlan: 2000,
    priority: 2,
  },
};

export const Halfway: Story = {
  name: '里程碑 50%',
  args: {
    name: '考多益課程',
    purpose: '畢業前把英文證照拿到手，履歷多一個底氣。',
    target: 12000,
    saved: 7200,
    deadline: { year: 2026, month: 12 },
    monthlyPlan: 2000,
    allocatedThisMonth: 2000,
    priority: 3,
  },
};

export const NoPlan: Story = {
  name: '尚無法推估',
  args: { name: '露營裝備', purpose: '和朋友一起去合歡山看星星，帳篷要自己的。', target: 15000, saved: 0, monthlyPlan: null, priority: 4 },
};

export const Overdue: Story = {
  name: '已過預計日期',
  args: { name: '新耳機', purpose: '通勤時聽 podcast 用。', target: 10000, saved: 4000, deadline: { year: 2026, month: 9 }, monthlyPlan: 1000, priority: 5 },
};

export const Achieved: Story = {
  name: '超額達標',
  args: { name: '考多益課程', purpose: '畢業前把英文證照拿到手。', target: 12000, saved: 13000, deadline: { year: 2026, month: 12 }, monthlyPlan: 2000 },
};
