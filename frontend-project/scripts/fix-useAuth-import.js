 import { storeAuthToken } from "@utils/tokenStorage";
 /**
    * fix-useAuth-import.js
    *
    * 將所有從 '../hooks/useAuth' 導入的 useAuth 從命名導入轉換為默認導入。
    */

 module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);

    // 查找所有從 '../hooks/useAuth' 或類似路徑導入 useAuth 的導入聲明
    root.find(j.ImportDeclaration)
      .filter(path => {
        const importPath = path.node.source.value;
        // 檢查導入路徑是否包含 '/hooks/useAuth'
        return importPath.endsWith('/useAuth') || importPath === 'hooks/useAuth';
      })
      .forEach(path => {
        const importSpecifiers = path.node.specifiers;

        importSpecifiers.forEach((specifier, index) => {
          if (
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === 'useAuth'
          ) {
            // 將命名導入轉換為默認導入
            const localName = specifier.local.name;
            importSpecifiers[index] = j.importDefaultSpecifier(j.identifier(localName));
          }
        });
      });

    return root.toSource();
  };