// frontend-project/src/scripts/fix-craco-alias.js

const fs = require('fs');
const path = require('path');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // 定義別名映射，包含所有別名
  const aliasMap = {
    '@shared': 'src/shared',
    '@utils': 'src/utils',
    '@components': 'src/components',
    '@constants': 'src/constants',
    '@context': 'src/context',
    '@sockets': 'src/sockets',
    '@services': 'src/services',
    '@types': 'src/types',
    '@hooks': 'src/hooks',
    '@api': 'src/api',
    '@pages': 'src/pages',
    '@features': 'src/features',
  };

  const log = (message) => {
    console.log(`[fix-craco-alias] ${message}`);
  };

  let aliasesUpdated = false;

  // 查找 'webpack' 配置
  root.find(j.ObjectProperty, { key: { name: 'webpack' } })
    .forEach((webpackProp) => {
      const webpackValue = webpackProp.value;

      // 在 'webpack' 配置中查找 'alias' 屬性
      j(webpackValue).find(j.ObjectProperty, { key: { name: 'alias' } })
        .forEach((aliasProp) => {
          const aliasValue = aliasProp.value;

          if (aliasValue.type === 'ObjectExpression') {
            aliasValue.properties.forEach((prop) => {
              if (prop.type === 'ObjectProperty') {
                // 获取别名键名
                let aliasKey;
                if (prop.key.type === 'Identifier') {
                  aliasKey = prop.key.name;
                } else if (prop.key.type === 'StringLiteral') {
                  aliasKey = prop.key.value;
                }

                log(`Checking alias: "${aliasKey}"`);

                const expectedRelativePath = aliasMap[aliasKey];
                if (!expectedRelativePath) {
                  log(`No mapping found for alias "${aliasKey}". Skipping.`);
                  return;
                }

                // 获取当前别名路径
                let currentPath = '';
                if (prop.value.type === 'CallExpression' && prop.value.callee.type === 'MemberExpression') {
                  const objectName = prop.value.callee.object.name;
                  const propertyName = prop.value.callee.property.name;
                  if (objectName === 'path' && propertyName === 'resolve') {
                    if (prop.value.arguments.length >= 2 && prop.value.arguments[0].name === '__dirname') {
                      currentPath = prop.value.arguments[1].value.replace(/\/+$/, ''); // 移除结尾的斜杠
                    }
                  }
                } else if (prop.value.type === 'StringLiteral') {
                  currentPath = prop.value.value.replace(/\/+$/, ''); // 移除结尾的斜杠
                }

                log(`Alias "${aliasKey}" current path: "${currentPath}"`);
                log(`Alias "${aliasKey}" expected path: "${expectedRelativePath}"`);

                // 检查路径是否匹配
                if (currentPath !== expectedRelativePath) {
                  log(`Alias "${aliasKey}" path mismatch: current "${currentPath}" -> expected "${expectedRelativePath}". Updating...`);
                  // 更新路径为 path.resolve(__dirname, 'expectedRelativePath')
                  const newPath = j.callExpression(
                    j.memberExpression(j.identifier('path'), j.identifier('resolve')),
                    [j.identifier('__dirname'), j.literal(expectedRelativePath)]
                  );
                  prop.value = newPath;
                  aliasesUpdated = true;
                  log(`Alias "${aliasKey}" updated to path "${expectedRelativePath}".`);
                } else {
                  log(`Alias "${aliasKey}" path is correct.`);
                }

                // 检查对应路径是否存在
                const projectRoot = path.dirname(fileInfo.path); // frontend-project
                const fullPath = path.join(projectRoot, expectedRelativePath);
                if (!fs.existsSync(fullPath)) {
                  log(`Warning: Path "${expectedRelativePath}" for alias "${aliasKey}" does not exist.`);
                } else {
                  log(`Path "${expectedRelativePath}" for alias "${aliasKey}" exists.`);
                }
              }
            });
          }
        });
    });

  if (aliasesUpdated) {
    log(`Aliases were updated.`);
    return root.toSource();
  } else {
    log(`No aliases needed to be updated.`);
    return null;
  }
};