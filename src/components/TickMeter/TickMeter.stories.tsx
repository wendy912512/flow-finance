import type { Meta, StoryObj } from '@storybook/react-vite';
import { TickMeter } from './TickMeter';

const meta = {
  title: '元件/TickMeter 刻度進度',
  component: TickMeter,
  args: { value: 45000, max: 150000, label: '總進度', marks: [25, 50, 75] },
  decorators: [(S) => <div style={{ maxWidth: 360 }}><S /></div>],
  parameters: { docs: { description: { component: '刻度尺樣式的進度條；marks 以百分比標出里程碑，已達成的會亮起。' } } },
} satisfies Meta<typeof TickMeter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Savings: Story = { name: '存錢（綠）' };
export const Monthly: Story = { name: '本月（藍）', args: { value: 3000, max: 10500, label: '本月', tone: 'primary', marks: [] } };
export const Warning: Story = { name: '警示（黃）', args: { value: 9000, max: 10500, label: '預算', tone: 'warning', marks: [] } };
