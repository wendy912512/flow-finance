import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: '流向 Flow 元件庫',
    colorPrimary: '#2f5bea',
    colorSecondary: '#2f5bea',
    fontBase: '"IBM Plex Sans", "Noto Sans TC", system-ui, sans-serif',
  }),
});
