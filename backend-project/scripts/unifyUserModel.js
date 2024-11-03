/**
 * unifyUserModel.js
 *
 * 使用 jscodeshift 將後端項目中的 DeliveryPerson 模型替換為統一的 User 模型，
 * 並根據 role 屬性區分不同用戶類型。
 */

module.exports = function (fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let hasModifications = false;
  
    // 1. 替換模型導入 (ES6 模塊)
    root.find(j.ImportDeclaration, {
      source: { value: '../models/DeliveryPerson' }
    }).forEach(path => {
      if (path.node.source && path.node.specifiers) {
        path.node.source.value = '../models/User';
        path.node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            specifier.local.name = 'User';
          }
        });
        hasModifications = true;
        console.log(`Replaced import path in ${fileInfo.path}`);
      }
    });
  
    // 2. 替換模型導入 (CommonJS 模塊)
    root.find(j.CallExpression, {
      callee: { name: 'require' },
      arguments: [{ value: '../models/DeliveryPerson' }]
    }).forEach(path => {
      const parent = path.parent.node;
      if (parent && parent.type === 'VariableDeclarator' && parent.id && parent.id.name) {
        parent.id.name = 'User';
        path.node.arguments[0].value = '../models/User';
        hasModifications = true;
        console.log(`Replaced require path in ${fileInfo.path}`);
      }
    });
  
    // 3. 更新使用 DeliveryPerson 的代碼
    // 查找所有 DeliveryPerson.xxx 的調用，替換為 User.xxx
    root.find(j.MemberExpression, {
      object: { name: 'DeliveryPerson' }
    }).forEach(path => {
      if (path.node && path.node.object) {
        path.node.object.name = 'User';
        hasModifications = true;
        console.log(`Replaced DeliveryPerson with User in ${fileInfo.path}`);
      }
    });
  
    // 4. 在 User.find 調用中添加 role 過濾條件
    root.find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        object: { name: 'User' },
        property: { type: 'Identifier', name: 'find' }
      }
    }).forEach(path => {
      const args = path.node.arguments;
      if (args && args.length === 1 && args[0].type === 'ObjectExpression') {
        // 檢查是否已經有 role 過濾
        const hasRole = args[0].properties.some(prop => prop.key.name === 'role');
        if (!hasRole) {
          args[0].properties.push(
            j.property(
              'init',
              j.identifier('role'),
              j.literal('delivery_person')
            )
          );
          hasModifications = true;
          console.log(`Added role filter in ${fileInfo.path}`);
        }
      }
    });
  
    // 5. 添加詳細的 console.log 語句
    // 查找 try-catch 塊，並在 try 中的開頭和結尾添加 console.log
    root.find(j.TryStatement).forEach(path => {
      const tryBlock = path.node.block.body;
      if (tryBlock && Array.isArray(tryBlock) && tryBlock.length > 0) {
        // 添加 console.log at the beginning
        tryBlock.unshift(
          j.expressionStatement(
            j.callExpression(
              j.memberExpression(j.identifier('console'), j.identifier('log')),
              [j.literal(`Entering ${fileInfo.path}`)]
            )
          )
        );
  
        // 添加 console.log before each return statement
        j(path).find(j.ReturnStatement).forEach(returnPath => {
          j(returnPath).insertBefore(
            j.expressionStatement(
              j.callExpression(
                j.memberExpression(j.identifier('console'), j.identifier('log')),
                [j.literal(`Exiting ${fileInfo.path} with status code`)]
              )
            )
          );
        });
  
        hasModifications = true;
        console.log(`Added console.log statements in ${fileInfo.path}`);
      }
    });
  
    if (hasModifications) {
      return root.toSource();
    } else {
      return null;
    }
  };