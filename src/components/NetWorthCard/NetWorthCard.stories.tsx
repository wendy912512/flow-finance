import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { NetWorthCard } from './NetWorthCard';

const meta = {
  title: '元件/NetWorthCard 總資產',
  component: NetWorthCard,
  tags: ['autodocs'],
  args: { deposits: 112450, investmentValue: null, creditCardUnpaid: 0, onUpdateInvestment: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
} satisfies Meta<typeof NetWorthCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoInvestmentValue: Story = { name: '投資市值未輸入' };
export const WithInvestment: Story = { name: '含投資市值與信用卡', args: { investmentValue: 26340, investmentAsOf: '10/01', creditCardUnpaid: 2180 } };
