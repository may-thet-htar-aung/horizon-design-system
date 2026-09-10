/** @type { import('@storybook/html-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.stories.js'],
  framework: { name: '@storybook/html-vite', options: {} },
  // build/ holds the generated token data and CSS that the stories read.
  staticDirs: ['../build'],
};
