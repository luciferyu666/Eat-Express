import { storeAuthToken } from "@utils/tokenStorage";
// findLoggerImports.js

const fs = require('fs');
const path = require('path');

/**
 * 項目根目錄，默認為當前運行目錄
 */
const rootDir = process.argv[2] || '.';

/**
 * 支持的文件擴展名
 */
const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

/**
 * 忽略的目錄名稱
 */
const ignoreDirs = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'frontend-project/node_modules',
    'backend-project/node_modules'
];

/**
 * 用於存儲找到的文件
 */
let filesWithLoggerImports = [];

/**
 * 遞歸遍歷目錄
 * @param {string} dir - 目錄路徑
 */
function traverseDirectory(dir) {
    let files;
    try {
        files = fs.readdirSync(dir);
    } catch (err) {
        console.error(`無法讀取目錄: ${dir}`);
        return;
    }

    for (const file of files) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (err) {
            console.error(`無法獲取檔案狀態: ${fullPath}`);
            continue;
        }

        if (stat.isDirectory()) {
            if (!ignoreDirs.some(ignoreDir => fullPath.includes(ignoreDir))) {
                traverseDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (supportedExtensions.includes(ext)) {
                checkFileForLoggerImport(fullPath);
            }
        }
    }
}

/**
 * 檢查文件中是否引用了 './utils/logger'
 * @param {string} filePath - 文件路徑
 */
function checkFileForLoggerImport(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');

        // 使用正則表達式匹配 import 和 require
        const importRegex = /import\s.+\sfrom\s['"]\.\/utils\/logger['"]/;
        const requireRegex = /require\(['"]\.\/utils\/logger['"]\)/;

        // 另外，可能有 '../utils/logger' 或 './utils/logger.js', etc.
        const importRegexFlexible = /import\s.+\sfrom\s['"](.+\/)?utils\/logger['"]/;
        const requireRegexFlexible = /require\(['"](.+\/)?utils\/logger['"]\)/;

        if (importRegex.test(content) || requireRegex.test(content) ||
            importRegexFlexible.test(content) || requireRegexFlexible.test(content)) {
            filesWithLoggerImports.push(filePath);
            processFile(filePath, content);
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
    }
}

/**
 * 處理文件：移除 logger 引用並替換 logger.info 和 logger.error
 * @param {string} filePath - 文件路徑
 * @param {string} content - 文件內容
 */
function processFile(filePath, content) {
    let updatedContent = content;

    // 移除 import 或 require './utils/logger' 語句
    const importPattern = /import\s.+\sfrom\s['"]\.\/utils\/logger['"];\s*\n?/g;
    const requirePattern = /const\s+logger\s*=\s*require\(['"]\.\/utils\/logger['"]\);\s*\n?/g;

    updatedContent = updatedContent.replace(importPattern, '');
    updatedContent = updatedContent.replace(requirePattern, '');

    // 替換 logger.info(...) 為 console.log(...)
    const loggerInfoPattern = /logger\.info\(/g;
    updatedContent = updatedContent.replace(loggerInfoPattern, 'console.log(');

    // 替換 logger.error(...) 為 console.error(...)
    const loggerErrorPattern = /logger\.error\(/g;
    updatedContent = updatedContent.replace(loggerErrorPattern, 'console.error(');

    // 將更新後的內容寫回文件
    try {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ 已處理文件: ${filePath}`);
    } catch (error) {
        console.error(`無法寫入文件: ${filePath} - ${error.message}`);
    }
}

/**
 * 主函數
 */
function main() {
    const absoluteRoot = path.resolve(rootDir);
    console.log(`開始掃描目錄：${absoluteRoot}`);

    traverseDirectory(absoluteRoot);

    if (filesWithLoggerImports.length > 0) {
        console.log(`\n✅ 找到 ${filesWithLoggerImports.length} 個引用 './utils/logger' 模塊的文件，並已進行處理：\n`);
        filesWithLoggerImports.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });
    } else {
        console.log('\n🎉 未找到任何引用 ./utils/logger 模塊的文件。');
    }
}

main();