import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../Badge/Badge';
import { StatTile } from './StatTile';

const meta = {
  title: '元件/StatTile 統計卡',
  component: StatTile,
  tags: ['autodocs'],
  args: { label: '本月收入', value: 32500, meta: '薪資 32,000 · 其他 500' },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof StatTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '一般' };

export const Hero: Story = {
  name: '今天建議可花（主角）',
  args: {
    label: '今天建議可花',
    value: 375,
    hero: true,
    meta: '可自由花費 6,760 ÷ 18 天（含今天）',
    badge: <Badge tone="warning">受預算限制</Badge>,
  },
};

export const ZeroSpendable: Story = {
  name: '已無可花額度',
  args: {
    label: '今天建議可花',
    value: 0,
    hero: true,
    meta: '本月變動預算已超出 1,240',
    badge: <Badge tone="danger">超支</Badge>,
  },
};

export const Row: Story = {
  name: '並排',
  decorators: [(Story) => <div style={{ maxWidth: 'none' }}><Story /></div>],
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
      <StatTile label="本月收入" value={32500} meta="薪資 32,000 · 其他 500" />
      <StatTile label="本月支出" value={11540} meta="變動 8,240 · 固定 3,300" />
      <StatTile label="待支付" value={3933} meta="電信費、筆電分期 2/6" />
    </div>
  ),
};
