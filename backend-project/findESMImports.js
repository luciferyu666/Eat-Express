// findESMImports.js

const fs = require('fs');
const path = require('path');

/**
 * 當前目錄作為根目錄
 */
const rootDir = process.argv[2] || '.';

/**
 * 支持的文件擴展名
 */
const supportedExtensions = ['.js', '.jsx', '.mjs', '.ts', '.tsx'];

/**
 * 忽略的目錄名稱
 */
const ignoreDirs = ['node_modules', '.git', 'dist', 'build'];

/**
 * 用於存儲找到的文件
 */
let filesWithESM = [];

/**
 * 遞歸遍歷目錄
 * @param {string} dir - 目錄路徑
 */
function traverseDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                traverseDirectory(fullPath);
            }
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (supportedExtensions.includes(ext)) {
                checkFileForESM(fullPath);
            }
        }
    }
}

/**
 * 檢查文件中是否包含 ESM `import` 語句
 * @param {string} filePath - 文件路徑
 */
function checkFileForESM(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        for (const line of lines) {
            // 排除註釋行
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
                continue;
            }

            // 正則表達式匹配 ESM import 語句
            const importRegex = /^import\s.+\sfrom\s['"].+['"];?$/;
            const dynamicImportRegex = /import\(['"].+['"]\)/;

            if (importRegex.test(trimmedLine) || dynamicImportRegex.test(trimmedLine)) {
                filesWithESM.push(filePath);
                break; // 不需要繼續檢查此文件
            }
        }
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
    }
}

/**
 * 主函數
 */
function main() {
    console.log(`開始掃描目錄：${path.resolve(rootDir)}`);
    traverseDirectory(rootDir);

    if (filesWithESM.length > 0) {
        console.log(`\n✅ 找到 ${filesWithESM.length} 個使用 ESM import 語句的文件：\n`);
        filesWithESM.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });
    } else {
        console.log('\n🎉 未找到任何使用 ESM import 語句的文件。');
    }
}

main();