import { storeAuthToken } from "@utils/tokenStorage";
/**
 * updateApiPaths.js
 *
 * 使用 jscodeshift 将前端项目中的 API 请求路径从带有 `/api` 前缀的路径更新为不带前缀的相对路径。
 * 确保所有 API 请求使用 `axiosInstance`，并在请求调用前添加详细的 `console.log` 日志输出以帮助调试。
 */

module.exports = function(fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let hasModifications = false;
  
    // 查找所有 axiosInstance 的调用
    root.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          name: 'axiosInstance' // 确保 axiosInstance 名称一致
        },
        property: {
          type: 'Identifier',
          name: /^(get|post|put|delete|patch)$/ // 常用的 HTTP 方法
        }
      }
    }).forEach(path => {
      const args = path.node.arguments;
      if (args.length > 0 && (args[0].type === 'StringLiteral' || args[0].type === 'TemplateLiteral')) {
        let originalPath = '';
        let newPath = '';
  
        if (args[0].type === 'StringLiteral') {
          originalPath = args[0].value;
          if (originalPath.startsWith('/api')) {
            newPath = originalPath.replace(/^\/api/, '');
            args[0].value = newPath;
            hasModifications = true;
            console.log(`Updated API path in ${fileInfo.path}: "${originalPath}" -> "${newPath}"`);
  
            // 添加 console.log 语句在调用之前
            const consoleLog = j.expressionStatement(
              j.callExpression(
                j.memberExpression(j.identifier('console'), j.identifier('log')),
                [j.literal(`Making API request to ${newPath}`)]
              )
            );
  
            // 插入 console.log 语句前置
            const parentBlock = j(path).closest(j.BlockStatement).get('body');
            parentBlock.unshift(consoleLog);
          }
        } else if (args[0].type === 'TemplateLiteral') {
          // 处理模板字符串，如 `/api/${endpoint}`
          const quasis = args[0].quasis;
          if (quasis.length > 0 && quasis[0].value.raw.startsWith('/api')) {
            quasis[0].value.raw = quasis[0].value.raw.replace(/^\/api/, '');
            quasis[0].value.cooked = quasis[0].value.cooked.replace(/^\/api/, '');
            hasModifications = true;
            console.log(`Updated API template path in ${fileInfo.path}: TemplateLiteral modified`);
  
            // 添加 console.log 语句在调用之前
            const newPathExpression = j.templateLiteral(
              [j.templateElement({ raw: `Making API request to `, cooked: `Making API request to ` }, false), ...args[0].expressions.map(expr => j.templateElement({ raw: '', cooked: '' }, false))],
              args[0].expressions
            );
            const consoleLog = j.expressionStatement(
              j.callExpression(
                j.memberExpression(j.identifier('console'), j.identifier('log')),
                [newPathExpression]
              )
            );
  
            // 插入 console.log 语句前置
            const parentBlock = j(path).closest(j.BlockStatement).get('body');
            parentBlock.unshift(consoleLog);
          }
        }
      }
    });
  
    if (hasModifications) {
      return root.toSource();
    } else {
      return null;
    }
  };