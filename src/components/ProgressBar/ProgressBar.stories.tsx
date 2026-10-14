import type { Meta, StoryObj } from '@storybook/react-vite';
import { formatAmount } from '../../lib/money';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: '元件/ProgressBar 進度條',
  component: ProgressBar,
  tags: ['autodocs'],
  args: { value: 4120, max: 6000, label: '餐飲預算' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['budget', 'savings'] },
    size: { control: 'inline-radio', options: ['md', 'lg'] },
  },
  decorators: [(Story) => <div style={{ maxWidth: 420 }}><Story /></div>],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Budget: Story = { name: '預算' };
export const OverBudget: Story = { name: '超支', args: { value: 1560, max: 1500, label: '購物預算' } };
export const Savings: Story = { name: '存錢目標', args: { value: 45000, max: 150000, tone: 'savings', size: 'lg', milestones: true, label: '冰島目標' } };

const rows = [
  { name: '購物', used: 1560, budget: 1500 },
  { name: '餐飲', used: 4120, budget: 6000 },
  { name: '交通', used: 1280, budget: 2000 },
  { name: '娛樂', used: 860, budget: 1500 },
  { name: '學習', used: 420, budget: 1000 },
];

export const CategoryBudgets: Story = {
  name: '分類預算清單',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {rows.map((r) => {
        const over = r.used > r.budget;
        return (
          <div key={r.name} style={{ display: 'grid', gap: 'var(--space-1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>{r.name}</span>
              <span style={{ color: over ? 'var(--danger)' : 'var(--ink-muted)', fontWeight: over ? 600 : 400 }}>
                {over ? '超支 ' : '剩 '}
                <span className="num">{formatAmount(Math.abs(r.budget - r.used))}</span>
              </span>
            </div>
            <ProgressBar value={r.used} max={r.budget} label={`${r.name}預算`} />
            <span className="num" style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
              {formatAmount(r.used)} / {formatAmount(r.budget)}
            </span>
          </div>
        );
      })}
    </div>
  ),
};
