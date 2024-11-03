// check-ts-syntax.js

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * 定义需要扫描的项目目录
 */
const projects = [
  'frontend-project/src',
  'backend-project' // 假设后端源代码位于 backend-project 根目录下
];

/**
 * 定义需要排除的目录
 */
const excludeDirs = ['node_modules', 'dist', 'build', '.git'];

/**
 * 定义 TypeScript 特有的 AST 节点类型
 */
const tsSyntaxNodes = [
  'TSEnumDeclaration',
  'TSInterfaceDeclaration',
  'TSTypeAliasDeclaration',
  'TSDeclareFunction',
  'TSDeclareVariable',
  'TSTypeParameterInstantiation',
  'TSTypeAnnotation',
  'TSFunctionType',
  'TSIndexedAccessType',
  'TSMappedType',
  'TSConditionalType',
  'TSTypePredicate',
  'TSAsExpression',
  'TSNonNullExpression',
  'TSImportType',
  'TSNamespaceExportDeclaration'
];

/**
 * 存储包含 TypeScript 语法的文件
 */
const filesWithTSSyntax = {};

/**
 * 遍历目录并收集所有 JavaScript 和 JSX 文件，排除指定目录
 * @param {string} dir - 目标目录
 * @returns {string[]} - 文件路径数组
 */
function getAllJSFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        results = results.concat(getAllJSFiles(filePath));
      }
    } else {
      if (/\.(js|jsx)$/.test(file)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

/**
 * 检查文件中是否存在 TypeScript 特有的语法
 * @param {string} filePath - JavaScript 文件路径
 */
function checkFileForTSSyntax(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');

  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript', // 启用 TypeScript 插件
        'classProperties',
        'dynamicImport',
        'decorators-legacy'
      ]
    });
  } catch (error) {
    // 如果解析时出错，可能包含 TypeScript 语法
    // 捕获语法错误并记录
    if (error.message.includes('Unexpected token') || error.message.includes('Type annotation')) {
      if (!filesWithTSSyntax[filePath]) {
        filesWithTSSyntax[filePath] = [];
      }
      filesWithTSSyntax[filePath].push('Parsing Error: ' + error.message);
    }
    return;
  }

  traverse(ast, {
    enter(path) {
      const nodeType = path.node.type;
      if (tsSyntaxNodes.includes(nodeType)) {
        if (!filesWithTSSyntax[filePath]) {
          filesWithTSSyntax[filePath] = new Set();
        }
        filesWithTSSyntax[filePath].add(nodeType);
      }
    }
  });
}

/**
 * 主函数
 */
function main() {
  projects.forEach(project => {
    const projectPath = path.resolve(__dirname, '..', project); // 假设 ts-syntax-checker 与 frontend-project 和 backend-project 是同级
    if (!fs.existsSync(projectPath)) {
      console.error(`目录不存在: ${projectPath}`);
      return;
    }

    const jsFiles = getAllJSFiles(projectPath);
    jsFiles.forEach(file => {
      checkFileForTSSyntax(file);
    });
  });

  // 输出结果
  if (Object.keys(filesWithTSSyntax).length === 0) {
    console.log('✅ 所有 JavaScript 文件均不包含 TypeScript 特有的语法。');
  } else {
    console.log('⚠️ 发现包含 TypeScript 特有语法的 JavaScript 文件：\n');
    Object.keys(filesWithTSSyntax).forEach(file => {
      console.log(`文件: ${file}`);
      const issues = Array.from(filesWithTSSyntax[file]);
      issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
      console.log('');
    });
  }
}

// 执行主函数
main();