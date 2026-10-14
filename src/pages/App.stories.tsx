import type { Meta, StoryObj } from '@storybook/react-vite';
import App from '../App';

const meta = {
  title: '頁面/整個應用（可切換分頁）',
  component: App,
  parameters: { layout: 'fullscreen', docs: { description: { component: '點導航列可在總覽與交易之間切換；其他分頁尚在開發中。' } } },
  decorators: [(Story) => <div style={{ margin: 'calc(var(--space-6) * -1)' }}><Story /></div>],
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: '應用程式', args: { animateIn: false } };
