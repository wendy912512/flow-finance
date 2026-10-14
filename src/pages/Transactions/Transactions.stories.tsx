import type { Meta, StoryObj } from '@storybook/react-vite';
import { Transactions } from './Transactions';

const meta = {
  title: '頁面/交易',
  component: Transactions,
  parameters: { layout: 'fullscreen', docs: { description: { component: '本月交易，依日期分組，可篩選支出／收入／轉帳。示範資料。' } } },
  decorators: [(Story) => <div style={{ margin: 'calc(var(--space-6) * -1)' }}><Story /></div>],
} satisfies Meta<typeof Transactions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = { name: '桌機' };
export const Mobile: Story = { name: '手機', globals: { viewport: { value: 'mobile2', isRotated: false } } };
