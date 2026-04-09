// 注意：Tailwind v4 由 @tailwindcss/vite 插件處理，不需要 @tailwindcss/postcss
export default {
  plugins: {
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
