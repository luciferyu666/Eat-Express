// frontend-project/craco.config.js

const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared/'),
      '@utils': path.resolve(__dirname, 'src/utils/'),
      '@components': path.resolve(__dirname, 'src/components/'),
      '@constants': path.resolve(__dirname, 'src/constants/'),
      '@context': path.resolve(__dirname, 'src/context/'),
      '@sockets': path.resolve(__dirname, 'src/sockets/'),
      '@services': path.resolve(__dirname, 'src/services/'),
      '@types': path.resolve(__dirname, 'src/types/'),
      '@hooks': path.resolve(__dirname, 'src/hooks/'),
      '@api': path.resolve(__dirname, 'src/api/'),
      '@pages': path.resolve(__dirname, 'src/pages/'),
      '@features': path.resolve(__dirname, 'src/features/'),
      '@routes': path.resolve(__dirname, 'src/routes/'), // 新增路由別名配置
    },
    configure: (webpackConfig, { env, paths }) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('Applying custom Webpack configuration');
      }

      // 添加對 Node.js 核心模塊的 polyfill 配置
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
        process: require.resolve('process/browser.js'), // 修正這裡，添加 ".js"
        path: require.resolve('path-browserify'),
        vm: require.resolve('vm-browserify'),
        fs: false,    // 不提供 fs 模塊
        net: false,   // 不提供 net 模塊
        tls: false,   // 不提供 tls 模塊
      };

      // 確保 Webpack 解析指定的文件擴展名
      webpackConfig.resolve.extensions = [
        '.js',
        '.jsx',
        '.json',
        '.mjs',
        '.ts',  // TypeScript 文件支持
        '.tsx', // TypeScript JSX 文件支持
      ];

      // 確保 Babel 能正確處理 'src' 目錄中的代碼
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule) {
        const jsRule = oneOfRule.oneOf.find(
          (rule) =>
            rule.test && rule.test.toString().includes('jsx') && rule.include
        );
        if (jsRule) {
          jsRule.include = [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, 'src/shared'),
            path.resolve(__dirname, 'src/hooks'),
            path.resolve(__dirname, 'src/context'),
          ];
        }
      }

      // 使用 ProvidePlugin 自動加載模塊，避免在每個模塊中手動導入
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser.js', // 自動提供 process 變量，添加 ".js"
          Buffer: ['buffer', 'Buffer'], // 自動提供 Buffer
        })
      );

      // 替換過時的 devServer 配置，使用 setupMiddlewares
      if (webpackConfig.devServer) {
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          // 在此處插入您原先的中間件配置
          // 例如：
          // devServer.app.get('/some/path', (req, res) => { ... });

          // 返回中間件數組
          return middlewares;
        };
      }

      // 添加一個規則來處理 .mjs 文件，避免 fullySpecified 錯誤
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      return webpackConfig;
    },
  },
};