// frontend-project/scripts/fix-imports.js

module.exports = function transformer(fileInfo, api, options) {
    const j = api.jscodeshift;
    const filePath = fileInfo.path;
    const root = j(fileInfo.source);
  
    const log = (message) => {
      console.log(`[fix-imports] ${message}`);
    };
  
    let fileModified = false;
  
    // 定义需要替换的导入路径映射
    const importPathMap = {
      '@utils/authService': '@services/authService',
      '@utils/UserContext': '@context/UserContext',
      // 如果有更多需要替换的路径，请在此处添加
      // 例如:
      // '@utils/api': '@services/api',
      // '@utils/logger': '@services/logger',
    };
  
    // 查找并处理 ImportDeclaration
    root.find(j.ImportDeclaration).forEach(path => {
      const importNode = path.node;
      const sourceValue = importNode.source.value;
  
      // 记录所有导入路径
      log(`Found import path: '${sourceValue}' in file: ${filePath}`);
  
      // 检查当前导入路径是否在需要替换的映射中
      if (importPathMap.hasOwnProperty(sourceValue)) {
        const newSourceValue = importPathMap[sourceValue];
        log(`Found import to replace: '${sourceValue}' -> '${newSourceValue}'`);
  
        // 替换导入路径
        importNode.source = j.literal(newSourceValue);
        fileModified = true;
        log(`Replaced import path: '${sourceValue}' -> '${newSourceValue}'`);
      }
    });
  
    if (fileModified) {
      log(`File modified: ${filePath}`);
      return root.toSource({ quote: 'single' });
    } else {
      log(`No target imports found in file: ${filePath}`);
      return null; // 如果文件未修改，则返回 null，jscodeshift 将跳过写入该文件
    }
  };