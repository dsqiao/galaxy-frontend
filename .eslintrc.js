module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'comma-dangle': "off", // 不管结尾加不加逗号了
    'prefer-const': 'off',
    'vue/no-unused-components': 'off',
    'no-unused-vars': 'off',
    'no-unreachable': 'off',
    'no-lone-blocks': 'off',
    'no-trailing-spaces': 'off',
    'quotes': 'off',
  }
}
