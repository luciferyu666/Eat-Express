/**
 * JSCodeshift script to update import paths for authService and UserContext.
 *
 * Usage:
 * npx jscodeshift -t scripts/fix-import-paths.js src
 */

const { getOptions } = require('jscodeshift');

module.exports = function (fileInfo, api, options) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  console.log(`Processing file: ${fileInfo.path}`);

  let hasModifications = false;

  // 定義替換規則
  const replacements = [
    {
      oldPath: /^@utils\/authService(?:\.js|\.jsx)?$/,
      newPath: '@services/authService',
    },
    {
      oldPath: /^@utils\/UserContext(?:\.js|\.jsx)?$/,
      newPath: '@context/UserContext',
    },
  ];

  // 遍歷所有導入聲明
  root.find(j.ImportDeclaration).forEach(path => {
    const importSource = path.value.source.value;

    replacements.forEach(replacement => {
      if (replacement.oldPath.test(importSource)) {
        console.log(`Found import '${importSource}' in file: ${fileInfo.path} at line ${path.value.loc.start.line}`);
        path.value.source.value = replacement.newPath;
        hasModifications = true;
        console.log(`Replaced with '${replacement.newPath}'`);
      }
    });
  });

  if (!hasModifications) {
    console.log(`No matching imports found in file: ${fileInfo.path}`);
  }

  return hasModifications ? root.toSource() : null;
};