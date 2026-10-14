import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card/Card';
import { TransactionRow } from './TransactionRow';

const meta = {
  title: '元件/TransactionRow 交易列',
  component: TransactionRow,
  tags: ['autodocs'],
  args: { kind: 'expense', title: '路易莎咖啡', date: '10/14', detail: '餐飲', amount: 135, autoCategorized: true },
  argTypes: { kind: { control: 'inline-radio', options: ['expense', 'income', 'transfer', 'investment'] } },
  decorators: [(Story) => <Card style={{ maxWidth: 440, paddingTop: 'var(--space-1)', paddingBottom: 'var(--space-1)' }}><Story /></Card>],
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expense: Story = { name: '支出（自動分類）' };
export const Income: Story = { name: '收入', args: { kind: 'income', title: '十月薪資', date: '10/10', detail: '收入 · 中信', amount: 32000, autoCategorized: false, glyph: '薪' } };
export const Transfer: Story = { name: '轉帳', args: { kind: 'transfer', title: '中信 → 元大', date: '10/10', detail: '轉帳 · 薪水分配', amount: 5000, autoCategorized: false } };
export const Investment: Story = { name: '投資買入', args: { kind: 'investment', title: '0050 投資買入', date: '10/11', detail: '投資 · 不算支出', amount: 5000, autoCategorized: false } };

export const List: Story = {
  name: '最近交易清單',
  render: () => (
    <>
      <TransactionRow kind="expense" title="路易莎咖啡" date="今天" detail="餐飲" amount={135} autoCategorized />
      <TransactionRow kind="expense" title="台北捷運" date="10/13" detail="交通" amount={45} autoCategorized />
      <TransactionRow kind="expense" title="蝦皮購物" date="10/12" detail="購物" amount={680} />
      <TransactionRow kind="transfer" title="中信 → 元大" date="10/10" detail="轉帳 · 薪水分配" amount={5000} />
      <TransactionRow kind="income" title="十月薪資" date="10/10" detail="收入 · 中信" amount={32000} glyph="薪" />
    </>
  ),
};
