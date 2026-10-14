import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { AccountCard } from './AccountCard';

const meta = {
  title: '元件/AccountCard 帳戶卡面',
  component: AccountCard,
  tags: ['autodocs'],
  args: {
    bankName: '中國信託',
    roleLabel: '薪資入帳 · 日常暫代',
    balance: 92450,
    available: 9450,
    last4: '2048',
    onActivate: fn(),
  },
  argTypes: {
    face: { control: 'inline-radio', options: ['navy', 'graphite'] },
    status: { control: 'inline-radio', options: ['active', 'planned'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof AccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Salary: Story = { name: '薪資帳戶' };

export const Investment: Story = {
  name: '投資帳戶',
  args: { bankName: '元大銀行', roleLabel: '投資 · 交割現金', face: 'graphite', balance: 20000, balanceLabel: '現金餘額', footnote: '不含 ETF 市值', last4: '7731' },
};

export const Planned: Story = { name: '規劃中', args: { bankName: '國泰世華', roleLabel: '日常花費（預定）', status: 'planned' } };

export const Mobile: Story = { name: '手機尺寸', args: { size: 'sm' } };

export const CardWall: Story = {
  name: '卡片牆',
  render: (args) => (
    <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-1)' }}>
      <AccountCard {...args} />
      <AccountCard bankName="國泰世華" roleLabel="日常花費（預定）" status="planned" onActivate={args.onActivate} />
      <AccountCard bankName="元大銀行" roleLabel="投資 · 交割現金" face="graphite" balance={20000} balanceLabel="現金餘額" footnote="不含 ETF 市值" last4="7731" />
    </div>
  ),
};
