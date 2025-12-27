import baseConfig from './prettier-base.js';

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  ...baseConfig,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
