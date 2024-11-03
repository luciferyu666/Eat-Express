import { storeAuthToken } from "@utils/tokenStorage";
// updateSharedImports.js

module.exports = function transformer(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let hasModifications = false;
  
    // 查找所有從 '../shared/' 導入的語句
    root.find(j.ImportDeclaration)
      .filter(pathNode => {
        return pathNode.node.source.value.startsWith('@shared/');
      })
      .forEach(pathNode => {
        const oldPath = pathNode.node.source.value;
        const newPath = oldPath.replace('../shared', '@shared');
        console.log(`Updating import path from '${oldPath}' to '${newPath}' in file: ${fileInfo.path}`);
        pathNode.node.source = j.literal(newPath);
        hasModifications = true;
      });
  
    return hasModifications ? root.toSource({ quote: 'single' }) : null;
  };