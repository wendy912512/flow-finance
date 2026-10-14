import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';

const meta = {
  title: '元件/Card 卡片',
  component: Card,
  tags: ['autodocs'],
  args: { children: '卡片用 1px 邊框分層，不用陰影。', padding: 'md' },
  argTypes: { padding: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { name: '桌機 20px' };
export const Mobile: Story = { name: '手機 16px', args: { padding: 'sm' } };
export const Feature: Story = { name: '重點卡 24px', args: { padding: 'lg' } };
