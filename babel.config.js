const devPresets = ['@vue/babel-preset-app'];
const buildPresets = [
  [
    '@babel/preset-env',
  ],
  ['@vue/app',
    {useBuiltIns: 'entry'}
  ]
];
module.exports = {
  presets: (process.env.NODE_ENV === 'development' ? devPresets : buildPresets),
  plugins: [
    ["@babel/plugin-proposal-decorators", { "legacy": true }]
  ],
  env: {
    production: {
      plugins: [["inline-dotenv",{
        path: '.env.production'
      }]]
    },
    development: {
      plugins: [["inline-dotenv",{
        path: '.env.development'
      }]]
    }
  }
};
