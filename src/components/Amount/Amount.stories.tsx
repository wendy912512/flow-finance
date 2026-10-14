import type { Meta, StoryObj } from '@storybook/react-vite';
import { Amount } from './Amount';

const meta = {
  title: '元件/Amount 金額',
  component: Amount,
  tags: ['autodocs'],
  args: { value: 92450, size: 'lg', currency: true },
  argTypes: {
    size: { control: 'inline-radio', options: ['hero', 'xl', 'lg', 'md', 'sm', 'xs'] },
    tone: { control: 'inline-radio', options: ['default', 'muted', 'primary', 'savings', 'danger'] },
    sign: { control: 'inline-radio', options: ['none', 'auto', 'always'] },
  },
} satisfies Meta<typeof Amount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { name: '試玩' };

export const Scale: Story = {
  name: '字級階層',
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <Amount value={375} size="hero" tone="primary" currency />
      <Amount value={112450} size="xl" currency />
      <Amount value={92450} size="lg" />
      <Amount value={105000} size="md" />
      <Amount value={-135} size="sm" sign="always" />
      <Amount value={4120} size="xs" tone="muted" />
    </div>
  ),
};

export const TabularAlignment: Story = {
  name: '等寬數字對齊',
  parameters: { docs: { description: { story: '每個數字等寬，右對齊時個位、十位、百位上下對齊。' } } },
  render: () => (
    <div style={{ display: 'grid', justifyItems: 'end', gap: 'var(--space-1)', width: 160 }}>
      {[111111, 98765, 4120, 1880, 375, -60].map((v) => (
        <Amount key={v} value={v} size="md" />
      ))}
    </div>
  ),
};
