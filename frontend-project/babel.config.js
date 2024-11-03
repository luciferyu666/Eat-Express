// frontend-project/babel.config.js

module.exports = {
  presets: [
    '@babel/preset-env',       // 转换现代 JavaScript 以兼容旧环境
    '@babel/preset-react',     // 转换 JSX 语法
    // 其他预设可以在此添加
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',              // 支持类属性语法
    '@babel/plugin-proposal-private-methods',              // 支持私有方法
    '@babel/plugin-proposal-private-property-in-object',    // 支持对象中的私有属性
    // 其他插件可以在此添加
  ],
};