import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/updateAliases.js

/**
 * jscodeshift 轉換腳本
 *
 * 功能：
 * - 將所有導入語句中指向舊位置的 `shared/roles` 模塊更新為新的別名導入 `@shared/roles`。
 * - 將相對路徑導入的 `utils/*` 模塊更新為使用別名導入 `@utils/*`。
 * - 將相對路徑導入的其他模塊（如 `components/*`、`constants/*`、`context/*` 和 `sockets/*`）更新為使用對應的別名導入。
 *
 * 使用：
 *   npx jscodeshift -t updateAliases.js src/
 *
 * 日誌：
 * - 輸出被修改的文件路徑和具體的更改內容。
 */

module.exports = function(fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  let fileChanged = false;

  // 定義別名更新規則
  const aliasUpdates = [
    {
      // 更新 shared/roles 的導入
      patterns: [
        /^\.{1,2}\/shared\/roles$/, // './shared/roles' 或 '../shared/roles'
        /^@shared\/roles$/ // '@shared/roles' 指向舊位置
      ],
      newPath: '@shared/roles'
    },
    {
      // 更新 utils/* 的導入
      patterns: [
        /^\.{1,2}\/utils\/(.+)$/, // './utils/authService' 或 '../utils/authService'
      ],
      newPath: (match) => `@utils/${match[1]}`
    },
    {
      // 更新 components/* 的導入
      patterns: [
        /^\.{1,2}\/components\/(.+)$/, // './components/Button' 或 '../components/Button'
      ],
      newPath: (match) => `@components/${match[1]}`
    },
    {
      // 更新 constants/* 的導入
      patterns: [
        /^\.{1,2}\/constants\/(.+)$/, // './constants/roles' 或 '../constants/roles'
      ],
      newPath: (match) => `@constants/${match[1]}`
    },
    {
      // 更新 context/* 的導入
      patterns: [
        /^\.{1,2}\/context\/(.+)$/, // './context/UserContext' 或 '../context/UserContext'
      ],
      newPath: (match) => `@context/${match[1]}`
    },
    {
      // 更新 sockets/* 的導入
      patterns: [
        /^\.{1,2}\/sockets\/(.+)$/, // './sockets/socket' 或 '../sockets/socket'
      ],
      newPath: (match) => `@sockets/${match[1]}`
    },
    {
      // 更新 services/* 的導入
      patterns: [
        /^\.{1,2}\/services\/(.+)$/, // './services/authService' 或 '../services/authService'
      ],
      newPath: (match) => `@services/${match[1]}`
    },
    // 可以在此添加更多別名更新規則
  ];

  // 遍歷所有 ImportDeclaration 節點
  root.find(j.ImportDeclaration)
    .forEach(path => {
      const importPath = path.node.source.value;

      aliasUpdates.forEach(aliasUpdate => {
        aliasUpdate.patterns.forEach(pattern => {
          const match = importPath.match(pattern);
          if (match) {
            const newImportPath = typeof aliasUpdate.newPath === 'function'
              ? aliasUpdate.newPath(match)
              : aliasUpdate.newPath;

            // 記錄更改
            console.log(`修改文件：${fileInfo.path}`);
            console.log(`  將導入路徑 "${importPath}" 更新為 "${newImportPath}"`);

            // 更新導入路徑
            path.node.source.value = newImportPath;

            fileChanged = true;
          }
        });
      });
    });

  // 如果文件有更改，返回修改後的源代碼
  if (fileChanged) {
    return root.toSource({ quote: 'single' });
  }

  // 如果沒有更改，返回 undefined 保持文件不變
  return undefined;
};