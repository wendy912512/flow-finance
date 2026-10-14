import type { Meta, StoryObj } from '@storybook/react-vite';
import { dailyVariableSpend, daysInMonth, variableBudget } from '../../demo/data';
import { Card } from '../Card/Card';
import { SpendingChart } from './SpendingChart';

const meta = {
  title: '元件/SpendingChart 支出累計圖',
  component: SpendingChart,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '每個點都是當天的實際累計；虛線是日常預算。滑鼠移到線上（或聚焦後用左右鍵）看每天的金額。' } } },
  args: { daily: dailyVariableSpend, daysInMonth, month: 10, budget: variableBudget },
  decorators: [(Story) => <Card style={{ maxWidth: 640 }}><Story /></Card>],
} satisfies Meta<typeof SpendingChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MidMonth: Story = { name: '10/14' };
export const OverBudget: Story = { name: '超出預算', args: { daily: [...dailyVariableSpend, 2400, 1800, 1900, 1500] } };
