import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: '元件/Button 按鈕',
  component: Button,
  tags: ['autodocs'],
  args: { children: '＋ 記一筆', onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'savings', 'ghost'] },
    size: { control: 'inline-radio', options: ['lg', 'md', 'sm'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { name: '主要', args: { variant: 'primary' } };
export const Secondary: Story = { name: '次要', args: { variant: 'secondary', children: '轉帳' } };
export const Savings: Story = { name: '存錢', args: { variant: 'savings', children: '分配資金' } };
export const Ghost: Story = { name: '文字', args: { variant: 'ghost', children: '全部目標 →' } };
export const Disabled: Story = { name: '停用', args: { variant: 'primary', children: '確認分配', disabled: true } };

export const Sizes: Story = {
  name: '尺寸',
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button {...args} size="lg">大 48px</Button>
      <Button {...args} size="md">中 40px</Button>
      <Button {...args} size="sm" variant="secondary">已付款</Button>
    </div>
  ),
};

export const FullWidthMobile: Story = {
  name: '手機滿版',
  args: { fullWidth: true, children: '儲存' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: (args) => (
    <div style={{ maxWidth: 358 }}>
      <Button {...args} />
    </div>
  ),
};
