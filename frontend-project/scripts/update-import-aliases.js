// frontend-project/scripts/update-import-aliases.js

const { defineTemplate } = require('jscodeshift/src/Parser');
const path = require('path');

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let fileChanged = false;

  // 定義別名映射
  const aliasMappings = {
    '@context': 'src/context',
    '@sockets': 'src/sockets',
    '@services': 'src/services',
    '@api': 'src/api',
    '@utils': 'src/utils',
    '@components': 'src/components',
    '@shared': 'src/shared',
  };

  // 定義需要替換的相對路徑模式
  const relativePathPatterns = Object.entries(aliasMappings).map(([alias, relPath]) => {
    // 將相對路徑轉為絕對路徑
    const absPath = path.resolve('frontend-project', relPath);
    return {
      alias,
      relPath: relPath.replace(/\\/g, '/'), // 確保使用正斜線
      absPath,
    };
  });

  // 遍歷所有的 ImportDeclaration
  root.find(j.ImportDeclaration).forEach(pathNode => {
    const importPath = pathNode.node.source.value;

    // 忽略外部模塊（如 'react'、'axios' 等）
    if (!importPath.startsWith('.')) {
      return;
    }

    // 移除 /api 前綴
    let newImportPath = importPath.replace(/^\.\/api\//, '/');

    // 遍歷別名映射，找到匹配的相對路徑並替換為別名
    for (const mapping of relativePathPatterns) {
      const { alias, relPath } = mapping;

      // 構建相對路徑正則表達式
      const regex = new RegExp(`^\\.\\/${relPath}/?(.*)$`);

      if (regex.test(importPath)) {
        const matched = importPath.match(regex);
        const remainderPath = matched[1] ? `/${matched[1]}` : '';
        newImportPath = `${alias}${remainderPath}`;
        console.log(`[INFO] ${fileInfo.path}: Replacing '${importPath}' with '${newImportPath}'`);
        fileChanged = true;
        break;
      }
    }

    // 更新導入路徑
    if (importPath !== newImportPath) {
      pathNode.node.source = j.literal(newImportPath);
    }
  });

  // 移除 /api 前綴的 API 請求路徑
  root.find(j.CallExpression, {
    callee: { name: 'api' },
  }).forEach(pathNode => {
    const args = pathNode.node.arguments;
    if (args.length > 0 && typeof args[0].value === 'string') {
      const originalPath = args[0].value;
      if (originalPath.startsWith('/api/')) {
        const updatedPath = originalPath.replace(/^\/api\//, '/');
        args[0].value = updatedPath;
        console.log(`[INFO] ${fileInfo.path}: Removing '/api' prefix from API request path '${originalPath}' to '${updatedPath}'`);
        fileChanged = true;
      }
    }
  });

  if (fileChanged) {
    return root.toSource();
  }
};