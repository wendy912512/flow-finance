import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { formatAmount } from '../../lib/money';
import { AmountInput } from './AmountInput';

const meta = {
  title: '元件/AmountInput 金額輸入',
  component: AmountInput,
  tags: ['autodocs'],
  args: { label: '分配金額', value: 5000, max: 9450, help: '從中信未預留可用 9,450 撥出', onChange: fn() },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
  render: function Render(args) {
    const [value, setValue] = useState<number | null>(args.value);
    return (
      <AmountInput
        {...args}
        value={value}
        onChange={(v) => {
          setValue(v);
          args.onChange(v);
        }}
      />
    );
  },
} satisfies Meta<typeof AmountInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '一般' };
export const OverMax: Story = { name: '超過可用金額', args: { value: 12000 } };
export const Empty: Story = { name: '空白', args: { value: null, help: `本月日常預算剩 ${formatAmount(6760)}` } };
