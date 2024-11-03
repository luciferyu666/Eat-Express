import { storeAuthToken } from "@utils/tokenStorage";
/**
 * jscodeshift script to update import statements for connectSocket
 *
 * This script finds all import declarations that import 'connectSocket' in any form
 * and updates the import path to '../utils/socket'.
 */

module.exports = function transformer(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let hasModifications = false;
  
    // 定義目標導入路徑
    const targetImportPath = '../utils/socket';
  
    // 添加日誌，顯示正在處理的文件
    console.log(`Processing file: ${fileInfo.path}`);
  
    // 查找所有導入 connectSocket 的 import 語句
    root.find(j.ImportDeclaration)
      .filter(pathNode => {
        const hasConnectSocket = pathNode.node.specifiers.some(specifier => {
          return (
            (specifier.type === 'ImportSpecifier' && specifier.imported.name === 'connectSocket') ||
            (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'connectSocket')
          );
        });
  
        if (hasConnectSocket) {
          console.log(`Found connectSocket import in file: ${fileInfo.path}`);
        }
  
        return hasConnectSocket;
      })
      .forEach(pathNode => {
        console.log(`Updating import in file: ${fileInfo.path}`);
        pathNode.node.source = j.literal(targetImportPath);
        hasModifications = true;
      });
  
    return hasModifications ? root.toSource({ quote: 'single' }) : null;
  };