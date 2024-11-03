const path = require('path');

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  let hasModifications = false;

  // 添加初始日誌：正在處理的文件
  console.log(`\n=== 處理文件: ${fileInfo.path} ===`);

  // 查找所有的 ImportDeclaration 節點
  root.find(j.ImportDeclaration).forEach(importPath => {
    const importSource = importPath.node.source.value;

    // 標準化導入路徑，移除文件擴展名
    const importPathNoExt = importSource.replace(/\.[^/.]+$/, '');

    // 添加日誌：當前導入路徑
    console.log(`發現導入路徑: "${importSource}"`);

    let newImportPath = importSource;

    // 定義需要替換的路徑對
    const pathReplacements = {
      '@utils/authService': '@services/authService',
      '@utils/UserContext': '@context/UserContext',
    };

    // 檢查當前導入路徑是否需要替換
    if (pathReplacements.hasOwnProperty(importPathNoExt)) {
      newImportPath = pathReplacements[importPathNoExt];

      // 添加日誌：路徑替換信息
      console.log(`將導入路徑從 "${importSource}" 修改為 "${newImportPath}"`);

      // 修改導入路徑
      importPath.node.source.value = newImportPath;
      hasModifications = true;
    } else {
      // 如果導入路徑不匹配，記錄未匹配的信息
      console.log(`導入路徑 "${importSource}" 不需要修改`);
    }

    // 添加額外日誌：當前導入路徑的狀態
    console.log(`當前導入路徑狀態: ${newImportPath === importSource ? '未修改' : '已修改'}`);
  });

  if (hasModifications) {
    // 添加日誌：文件已被修改
    console.log(`文件已修改: ${fileInfo.path}`);
    console.log(`=== 完成修改文件: ${fileInfo.path} ===\n`);
    return root.toSource();
  } else {
    // 添加日誌：文件無需修改
    console.log(`文件無需修改: ${fileInfo.path}`);
    console.log(`=== 完成處理文件: ${fileInfo.path} ===\n`);
    return null; // 返回 null 表示不修改文件
  }
};