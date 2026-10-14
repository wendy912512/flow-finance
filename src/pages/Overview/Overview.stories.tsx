import type { Meta, StoryObj } from '@storybook/react-vite';
import { Overview } from './Overview';

const meta = {
  title: '頁面/總覽',
  component: Overview,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '桌機（≥ 1200px）：左側米白面板；右側黑色舞台上是 3D 航線地球，右上為優先目標與其他目標，地球下方為總進度，再往下是本月日常支出與支出類別。導航列捲動時固定在上方。平板與手機：第一版的實心卡片堆疊。示範資料，非真實財務資料。',
      },
    },
  },
  decorators: [(Story) => <div style={{ margin: 'calc(var(--space-6) * -1)' }}><Story /></div>],
} satisfies Meta<typeof Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { name: '桌機' };
export const Mobile: Story = { name: '手機', globals: { viewport: { value: 'mobile2', isRotated: false } } };
export const NoAnimation: Story = { name: '桌機（無進場動畫）', args: { animateIn: false } };
