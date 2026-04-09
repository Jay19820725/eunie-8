export default {
  plugins: {
    '@tailwindcss/postcss': {},
    'postcss-preset-env': {
      stage: 2,
      features: {
        'nesting-rules': true,
        'oklab-function': true,
        'color-function': true,
      },
      browsers: ['Android >= 7', 'iOS >= 12', 'Chrome >= 80'],
    },
    autoprefixer: {},
  },
};
