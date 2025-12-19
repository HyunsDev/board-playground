import forceStaticCode from './force-static-code.js';

const plugin = {
  meta: {
    name: 'eslint-local-rules',
    version: '1.0.0',
  },
  rules: {
    'force-static-code': forceStaticCode,
  },
};

export default plugin;
