import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccountWallet } from './AccountWallet';

const meta = {
  title: '元件/AccountWallet 卡片錢包',
  component: AccountWallet,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '完整卡面堆疊：選中的卡片在最前面，其他卡露出上緣。點上緣或下方分頁切換，也可用左右鍵。' } } },
  args: {
    accounts: [
      { id: 'ctbc', bankName: '中國信託', roleLabel: '薪資入帳 · 日常暫代', balance: 92450, available: 9450, last4: '2048' },
      { id: 'yuanta', bankName: '元大銀行', roleLabel: '投資 · 交割現金', face: 'graphite', balance: 20000, balanceLabel: '現金餘額', footnote: '不含 ETF 市值', last4: '7731' },
      { id: 'cathay', bankName: '國泰世華', roleLabel: '日常花費（預定）', status: 'planned' },
    ],
  },
} satisfies Meta<typeof AccountWallet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '三張卡' };
export const Mobile: Story = { name: '手機尺寸', args: { size: 'sm' } };
