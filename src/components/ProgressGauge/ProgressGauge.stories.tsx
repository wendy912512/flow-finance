import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProgressGauge } from './ProgressGauge';

const meta = {
  title: '元件/ProgressGauge 環形進度',
  component: ProgressGauge,
  args: { value: 30, label: '30%', caption: '已存比例' },
  parameters: { docs: { description: { component: '270° 環形進度，用在目標的總達成率。value 為 0–100。' } } },
} satisfies Meta<typeof ProgressGauge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '預設' };
export const OnStage: Story = {
  name: '黑色舞台上',
  decorators: [(S) => <div style={{ background: 'var(--stage)', padding: 24, display: 'inline-block', ['--ink' as string]: 'var(--stage-ink)', ['--ink-muted' as string]: 'var(--stage-muted)', ['--line' as string]: 'var(--stage-line)', ['--savings' as string]: 'var(--stage-accent)' }}><S /></div>],
};
