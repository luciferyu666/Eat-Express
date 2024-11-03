/**
 * replaceTokenStorage.js
 *
 * 使用 jscodeshift 将所有直接存储令牌到 localStorage 或 sessionStorage 的调用替换为统一的 storeAuthTokens 函数调用。
 */

module.exports = function(fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let hasModifications = false;
  
    // 引入 storeAuthTokens 和 removeAuthTokens 函数
    const importDeclarations = root.find(j.ImportDeclaration, {
      source: { value: '../utils/tokenStorage' } // 使用相对路径
    });
  
    if (importDeclarations.size() === 0) {
      // 如果尚未导入 storeAuthTokens，则添加导入
      const utilsImport = j.importDeclaration(
        [
          j.importSpecifier(j.identifier('storeAuthTokens')),
          j.importSpecifier(j.identifier('removeAuthTokens'))
        ],
        j.literal('../utils/tokenStorage') // 使用相对路径
      );
      root.get().node.program.body.unshift(utilsImport);
      hasModifications = true;
      console.log(`Added import of storeAuthTokens and removeAuthTokens in ${fileInfo.path}`);
    }
  
    // 查找所有 localStorage.setItem('authToken', token) 或 sessionStorage.setItem('authToken', token) 调用
    root.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: {
          type: 'Identifier',
          name: /^(localStorage|sessionStorage)$/
        },
        property: {
          type: 'Identifier',
          name: 'setItem'
        }
      },
      arguments: [
        { type: 'Literal', value: 'authToken' },
        { type: 'Identifier' }
      ]
    }).forEach(path => {
      const storageType = path.node.callee.object.name; // localStorage 或 sessionStorage
      const tokenArg = path.node.arguments[1].name; // token 变量名
  
      // 查找 rememberMe、refreshToken 和 role 变量
      const parentScope = j(path).closest(j.FunctionDeclaration, j.FunctionExpression, j.ArrowFunctionExpression);
      const rememberMeVar = parentScope.find(j.VariableDeclarator, {
        id: { name: 'rememberMe' }
      });
      const refreshTokenVar = parentScope.find(j.VariableDeclarator, {
        id: { name: 'refreshToken' }
      });
      const roleVar = parentScope.find(j.VariableDeclarator, {
        id: { name: 'role' }
      });
  
      if (rememberMeVar.size() > 0 && refreshTokenVar.size() > 0 && roleVar.size() > 0) {
        const refreshTokenName = refreshTokenVar.get().node.id.name;
        const roleName = roleVar.get().node.id.name;
  
        // 替换为 storeAuthTokens(token, refreshToken, role, rememberMe)
        j(path).replaceWith(
          j.callExpression(
            j.identifier('storeAuthTokens'),
            [
              j.identifier(tokenArg),
              j.identifier(refreshTokenName),
              j.identifier(roleName),
              j.identifier('rememberMe')
            ]
          )
        );
        hasModifications = true;
        console.log(`Replaced ${storageType}.setItem('authToken', ${tokenArg}) with storeAuthTokens(${tokenArg}, ${refreshTokenName}, ${roleName}, rememberMe) in ${fileInfo.path}`);
      } else {
        // 如果没有找到相关变量，添加警告日志
        console.warn(`No rememberMe, refreshToken, or role variable found for setItem in ${fileInfo.path} at line ${path.node.loc.start.line}`);
      }
    });
  
    if (hasModifications) {
      return root.toSource();
    } else {
      return null;
    }
  };