import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overview } from './Overview';

const meta = {
  title: '頁面/總覽',
  component: Overview,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: '桌機：微透明玻璃卡片＋光暈背景；手機（寬度 < 768px）：第一版的實心卡片風格。示範資料，非真實財務資料。' } },
  },
  decorators: [(Story) => <div style={{ margin: 'calc(var(--space-6) * -1)' }}><Story /></div>],
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { name: '桌機' };

export const Mobile: Story = {
  name: '手機',
  globals: { viewport: { value: 'mobile2', isRotated: false } },
};

export const NoAnimation: Story = { name: '桌機（無進場動畫）', args: { animateIn: false } };
