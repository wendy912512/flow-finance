import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { iceland, thisMonth } from '../../demo/data';
import { FlightGoalHero } from './FlightGoalHero';

const meta = {
  title: '元件/FlightGoalHero 飛航進度',
  component: FlightGoalHero,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '旅行目標的主視覺：3D 地球可拖曳轉動，進頁面時鏡頭飛入。已存比例決定飛機位置；推估只依每月預計存入，不假設投資收益。',
      },
    },
  },
  args: { ...iceland, today: thisMonth, onAllocate: fn() },
  decorators: [(Story) => <div className="fl-backdrop" style={{ padding: 'var(--space-6)', margin: 'calc(var(--space-6) * -1)' }}><Story /></div>],
} satisfies Meta<typeof FlightGoalHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Iceland: Story = { name: '冰島 30%' };
export const AfterAllocation: Story = { name: '再分配 5,000 後', args: { saved: 50000, allocatedThisMonth: 5000 } };
export const AlmostThere: Story = { name: '快抵達 80%', args: { saved: 120000 } };
export const Behind: Story = { name: '需要調整', args: { monthlyPlan: 6000 } };
