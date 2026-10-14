import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta = {
  title: '元件/Badge 狀態標籤',
  component: Badge,
  tags: ['autodocs'],
  args: { children: '可如期', tone: 'savings' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'savings', 'warning', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: '試玩' };

export const AllTones: Story = {
  name: '所有狀態',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      <Badge tone="neutral">規劃中</Badge>
      <Badge tone="info">自動帶入</Badge>
      <Badge tone="savings">可如期</Badge>
      <Badge tone="warning">受預算限制</Badge>
      <Badge tone="danger">超支 60</Badge>
    </div>
  ),
};

export const Small: Story = { name: '小尺寸', args: { tone: 'neutral', size: 'sm', children: '自動' } };
