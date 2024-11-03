/**
 * transformRoutes.js
 *
 * 使用 jscodeshift 将后端路由文件从复数形式改为单数形式，
 * 统一导入 userController，更新路由路径，并添加详细的日志输出。
 */

const pluralize = require('pluralize');

module.exports = function(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  console.log('正在转换文件:', fileInfo.path);

  // 1. 更新导入的控制器为 userController
  // ...（之前的代码保持不变）

  // 2. 更新路由路径为单数形式并添加日志
  root.find(j.CallExpression, {
    callee: { object: { name: 'router' }, property: { type: 'Identifier' } }
  })
  .forEach(path => {
    const httpMethod = path.node.callee.property.name; // 如 get, post
    const args = path.node.arguments;

    if (args.length >= 2) {
      const routePathNode = args[0];
      let routePath = ''; // 在外部作用域中初始化 routePath

      if (routePathNode.type === 'Literal' && typeof routePathNode.value === 'string') {
        routePath = routePathNode.value;
        console.log('原始路由路径:', routePath);

        // 使用 pluralize.singular() 处理路径
        const updatedRoutePath = routePath.split('/').map(segment => {
          // 忽略路径参数，如 :orderId
          if (segment.startsWith(':') || segment === '') {
            return segment;
          }
          return pluralize.isPlural(segment) ? pluralize.singular(segment) : segment;
        }).join('/');

        if (updatedRoutePath !== routePath) {
          // 更新路由路径
          routePathNode.value = updatedRoutePath;
          routePath = updatedRoutePath; // 同步更新 routePath 变量
          console.log(`路由路径已更新为单数形式: ${updatedRoutePath}`);
        }
      }

      // ...（添加日志的代码保持不变）
    }
  });

  // 3. 返回修改后的代码
  const transformedSource = root.toSource({ quote: 'single' });
  if (transformedSource !== fileInfo.source) {
    return transformedSource;
  } else {
    return null;
  }
};