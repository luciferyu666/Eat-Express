import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/removeLogger.js

const fs = require('fs');
const path = require('path');
const util = require('util');
const babelParser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

// Promisify fs functions for easier async/await usage
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Directory to process
const SRC_DIR = path.join(__dirname, 'src');

// List to keep track of processed files
const processedFiles = [];

/**
 * Recursively traverse the directory to get all .js and .jsx files
 * @param {string} dir - Directory path
 * @returns {Promise<string[]>} - Array of file paths
 */
async function getAllJsFiles(dir) {
  let files = [];
  const items = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      const subFiles = await getAllJsFiles(fullPath);
      files = files.concat(subFiles);
    } else if (
      item.isFile() &&
      (fullPath.endsWith('.js') || fullPath.endsWith('.jsx'))
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Process a single file: remove logger import and replace logger usage with console
 * @param {string} filePath - File path
 */
async function processFile(filePath) {
  try {
    const code = await readFile(filePath, 'utf8');
    const ast = babelParser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties'],
    });

    let loggerImported = false;

    // Traverse the AST to find and remove logger import
    traverse(ast, {
      ImportDeclaration(path) {
        const importPath = path.node.source.value;
        if (importPath === '../../utils/logger') {
          loggerImported = true;
          path.remove();
        }
      },
      // For CommonJS require statements
      CallExpression(path) {
        if (
          path.node.callee.name === 'require' &&
          path.node.arguments.length === 1 &&
          path.node.arguments[0].value === '../../utils/logger'
        ) {
          loggerImported = true;
          path.parentPath.remove();
        }
      },
    });

    if (!loggerImported) {
      return; // No logger import found, skip replacement
    }

    // Traverse again to replace logger.method with console.method
    traverse(ast, {
      MemberExpression(path) {
        if (
          path.node.object.name === 'logger' &&
          path.node.property.type === 'Identifier'
        ) {
          path.node.object.name = 'console';
        }
      },
    });

    const output = generator(ast, {}, code);
    await writeFile(filePath, output.code, 'utf8');
    processedFiles.push(filePath);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

/**
 * Main function to execute the script
 */
async function main() {
  try {
    const jsFiles = await getAllJsFiles(SRC_DIR);
    for (const file of jsFiles) {
      await processFile(file);
    }

    if (processedFiles.length === 0) {
      console.log('No logger imports found in the project.');
    } else {
      console.log('Processed files:');
      processedFiles.forEach((file) => {
        console.log(`- ${path.relative(__dirname, file)}`);
      });
    }
  } catch (error) {
    console.error('Error during processing:', error);
  }
}

main();