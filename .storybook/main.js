/** @type { import('@storybook/react-vite').StorybookConfig } */
export default {
  stories: ['../stories/**/*.stories.js', '../src/components/**/*.stories.@(js|jsx)'],
  framework: { name: '@storybook/react-vite', options: {} },
  // build/ holds the generated token data and CSS that the stories read.
  staticDirs: ['../build'],
};
