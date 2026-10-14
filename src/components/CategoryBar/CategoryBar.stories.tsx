import type { Meta, StoryObj } from '@storybook/react-vite';
import { categorySpend } from '../../demo/data';
import { Card } from '../Card/Card';
import { CategoryBar } from './CategoryBar';

const meta = {
  title: '元件/CategoryBar 支出類別',
  component: CategoryBar,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: '顏色固定跟著類別：餐飲、居住、交通、購物、娛樂各有固定色，其餘折進「其他」。每段都印出名稱、比例與金額。' } } },
  args: { items: categorySpend },
  decorators: [(Story) => <Card style={{ maxWidth: 420 }}><Story /></Card>],
} satisfies Meta<typeof CategoryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const October: Story = { name: '10 月' };
export const Empty: Story = { name: '沒有支出', args: { items: [] } };
