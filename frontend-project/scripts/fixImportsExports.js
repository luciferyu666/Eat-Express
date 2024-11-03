import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/fixImportsExports.js

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

// 目标目录
const SRC_DIR = path.join(__dirname, 'src');

// 支持的文件扩展名
const FILE_EXTENSIONS = ['.js', '.jsx'];

// 获取所有目标文件
const getAllFiles = (dir, extensions) => {
  return glob.sync(`${dir}/**/*.{js,jsx}`, { nodir: true });
};

// 检查文件是否包含被非顶层包裹的 export/import
const processFile = (filePath) => {
  const code = fs.readFileSync(filePath, 'utf8');
  let ast;

  try {
    ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties', 'dynamicImport'],
    });
  } catch (error) {
    console.error(`Failed to parse ${filePath}: ${error.message}`);
    return;
  }

  let hasModifications = false;
  let exportStatements = [];
  let importStatements = [];
  let nodesToRemove = [];

  traverse(ast, {
    // 查找非顶层的 ExportNamedDeclaration 和 ExportDefaultDeclaration
    ExportNamedDeclaration(path) {
      if (!path.parentPath.isProgram()) {
        exportStatements.push(path.node);
        nodesToRemove.push(path);
        hasModifications = true;
      }
    },
    ExportDefaultDeclaration(path) {
      if (!path.parentPath.isProgram()) {
        exportStatements.push(path.node);
        nodesToRemove.push(path);
        hasModifications = true;
      }
    },
    ImportDeclaration(path) {
      if (!path.parentPath.isProgram()) {
        importStatements.push(path.node);
        nodesToRemove.push(path);
        hasModifications = true;
      }
    },
  });

  if (hasModifications) {
    // 移除非顶层的 export 和 import 语句
    nodesToRemove.forEach((nodePath) => nodePath.remove());

    // 将 import 语句添加到 AST 的顶层（文件的最前面）
    importStatements.reverse().forEach((importStmt) => {
      ast.program.body.unshift(importStmt);
    });

    // 将 export 语句添加到 AST 的顶层（文件的末尾）
    exportStatements.forEach((exportStmt) => {
      ast.program.body.push(exportStmt);
    });

    const newCode = generator(ast, { /* options */ }, code).code;
    fs.writeFileSync(filePath, newCode, 'utf8');
    console.log(`Fixed exports/imports in: ${filePath}`);
  }
};

// 主函数
const main = () => {
  const files = getAllFiles(SRC_DIR, FILE_EXTENSIONS);
  console.log(`Found ${files.length} files to process.`);

  files.forEach((file) => {
    processFile(file);
  });

  console.log('Import/Export fixing completed.');
};

main();