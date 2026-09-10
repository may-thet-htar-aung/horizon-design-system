// The real build output — the gallery renders using the same CSS the platforms ship.
import '../build/css/tokens.css';
import '../build/css/tokens-dark.css';
import './gallery.css';

/** @type { import('@storybook/html-vite').Preview } */
export default {
  globalTypes: {
    theme: {
      description: 'Token theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      // tokens-dark.css is scoped to [data-theme="dark"], so flip it on the root.
      document.documentElement.setAttribute('data-theme', context.globals.theme);
      const wrap = document.createElement('div');
      wrap.className = 'hz-root';
      const result = story();
      wrap.append(typeof result === 'string' ? document.createRange().createContextualFragment(result) : result);
      return wrap;
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
    options: {
      storySort: {
        order: ['Overview', 'Colour', 'Spacing', 'Typography', 'Elevation', 'Shape'],
      },
    },
  },
};
