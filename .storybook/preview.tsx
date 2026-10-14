import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../src/styles/global.css';

const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) ?? 'light';
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return (
    <div data-theme={theme} style={{ background: 'var(--bg)', color: 'var(--ink)', padding: 'var(--space-6)', minHeight: '100%' }}>
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: '淺色／深色主題',
      toolbar: {
        title: '主題',
        icon: 'mirror',
        items: [
          { value: 'light', title: '淺色', icon: 'sun' },
          { value: 'dark', title: '深色', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withTheme],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    options: {
      storySort: {
        order: ['介紹', '基礎', ['色彩', '字體', '間距與圓角'], '元件'],
      },
    },
  },
};

export default preview;
