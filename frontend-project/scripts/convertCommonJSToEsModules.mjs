import { storeAuthToken } from "@utils/tokenStorage";
// convertCommonJSToEsModules.mjs

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';

/**
 * 配置
 */
const FRONTEND_SRC_DIR = path.resolve('frontend-project', 'src');
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const BACKUP_DIR = path.resolve('backup-frontend-src');

/**
 * 备份前端 src 目录
 */
async function backupFrontendSrc() {
    try {
        if (await fs.pathExists(BACKUP_DIR)) {
            console.log(chalk.yellow(`备份目录已存在：${BACKUP_DIR}`));
        } else {
            await fs.copy(FRONTEND_SRC_DIR, BACKUP_DIR);
            console.log(chalk.green(`成功备份前端 src 目录到 ${BACKUP_DIR}`));
        }
    } catch (error) {
        console.error(chalk.red(`备份失败: ${error.message}`));
        process.exit(1);
    }
}

/**
 * 获取所有目标文件
 * @returns {Promise<string[]>} - 文件路径数组
 */
async function getAllFiles() {
    const pattern = `**/*{${FILE_EXTENSIONS.join(',')}}`;
    try {
        const files = await glob(pattern, { cwd: FRONTEND_SRC_DIR, absolute: true });
        return files;
    } catch (error) {
        console.error(chalk.red(`获取文件失败: ${error.message}`));
        process.exit(1);
    }
}

/**
 * 转换单个文件
 * @param {string} filePath - 文件路径
 * @param {string} code - 文件内容
 * @returns {string|null} - 修改后的代码或 null
 */
function convertFile(filePath, code) {
    let ast;
    try {
        ast = parse(code, {
            sourceType: 'unambiguous',
            plugins: [
                'jsx',
                'typescript',
                'classProperties',
                'dynamicImport',
                // 根据需要添加其他插件
            ],
        });
    } catch (error) {
        console.error(chalk.red(`解析失败: ${filePath}`));
        console.error(error.message);
        return null;
    }

    let isModified = false;

    // 获取 traverse 的默认导出
    const traverse = traverseModule.default || traverseModule;

    // 获取 generate 的默认导出
    const generate = generateModule.default || generateModule;

    traverse(ast, {
        // 转换 require 语句
        VariableDeclaration(path) {
            const { node } = path;
            node.declarations.forEach((declarator) => {
                if (
                    t.isCallExpression(declarator.init) &&
                    t.isIdentifier(declarator.init.callee, { name: 'require' }) &&
                    declarator.init.arguments.length === 1 &&
                    t.isStringLiteral(declarator.init.arguments[0])
                ) {
                    const source = declarator.init.arguments[0].value;
                    const specifier = declarator.id;

                    if (t.isIdentifier(specifier)) {
                        // const xxx = require('xxx');
                        const importDeclaration = t.importDeclaration(
                            [t.importDefaultSpecifier(t.identifier(specifier.name))],
                            t.stringLiteral(source)
                        );
                        path.replaceWith(importDeclaration);
                        isModified = true;
                    } else if (t.isObjectPattern(specifier)) {
                        // const { a, b } = require('xxx');
                        const importSpecifiers = specifier.properties.map((prop) => {
                            if (t.isRestElement(prop)) {
                                return t.importNamespaceSpecifier(prop.argument);
                            }
                            return t.importSpecifier(
                                t.identifier(prop.value.name),
                                t.identifier(prop.key.name)
                            );
                        });
                        const importDeclaration = t.importDeclaration(
                            importSpecifiers,
                            t.stringLiteral(source)
                        );
                        path.replaceWith(importDeclaration);
                        isModified = true;
                    } else if (t.isArrayPattern(specifier)) {
                        // const [a, b] = require('xxx'); (rare in ES Modules)
                        // ES Modules不支持数组解构的 import，建议手动处理
                        console.warn(chalk.yellow(`警告: 文件 ${filePath} 中存在不支持的数组解构 require 语句，请手动检查。`));
                    }
                }
            });
        },

        // 转换 module.exports = xxx
        AssignmentExpression(path) {
            const { node } = path;
            if (
                t.isMemberExpression(node.left) &&
                t.isIdentifier(node.left.object, { name: 'module' }) &&
                t.isIdentifier(node.left.property, { name: 'exports' })
            ) {
                // module.exports = xxx;
                const exportDefaultDeclaration = t.exportDefaultDeclaration(node.right);
                path.replaceWith(exportDefaultDeclaration);
                isModified = true;
            } else if (
                t.isMemberExpression(node.left) &&
                t.isIdentifier(node.left.object, { name: 'exports' }) &&
                t.isIdentifier(node.left.property)
            ) {
                // exports.xxx = xxx;
                const exportedName = node.left.property.name;
                const exportedValue = node.right;

                // export const xxx = xxx;
                const exportNamedDeclaration = t.exportNamedDeclaration(
                    t.variableDeclaration('const', [
                        t.variableDeclarator(t.identifier(exportedName), exportedValue),
                    ]),
                    []
                );
                path.replaceWith(exportNamedDeclaration);
                isModified = true;
            }
        },

        // 转换 module.exports.xxx = xxx
        MemberExpression(path) {
            const { node } = path;
            if (
                t.isMemberExpression(node.object) &&
                t.isIdentifier(node.object.object, { name: 'module' }) &&
                t.isIdentifier(node.object.property, { name: 'exports' })
            ) {
                // module.exports.xxx = xxx;
                const exportedName = node.property.name;
                const exportedValue = path.parent.right;

                // export const xxx = xxx;
                const exportNamedDeclaration = t.exportNamedDeclaration(
                    t.variableDeclaration('const', [
                        t.variableDeclarator(t.identifier(exportedName), exportedValue),
                    ]),
                    []
                );
                path.parentPath.replaceWith(exportNamedDeclaration);
                isModified = true;
            }
        },
    });

    if (isModified) {
        const output = generate(ast, {}, code).code;
        return output;
    }

    return null;
}

/**
 * 主函数
 */
async function main() {
    console.log(chalk.blue('开始备份前端 src 目录...'));
    await backupFrontendSrc();

    console.log(chalk.blue('扫描前端项目中的 CommonJS 模块语法...'));
    const allFiles = await getAllFiles();
    const modifiedFiles = [];

    for (const file of allFiles) {
        const relativePath = path.relative(FRONTEND_SRC_DIR, file);
        const code = await fs.readFile(file, 'utf8');
        const newCode = convertFile(file, code);
        if (newCode) {
            await fs.writeFile(file, newCode, 'utf8');
            modifiedFiles.push(relativePath);
            console.log(chalk.green(`✅ 已转换文件: ${relativePath}`));
        }
    }

    if (modifiedFiles.length > 0) {
        console.log(chalk.green(`\n✅ 已转换 ${modifiedFiles.length} 个文件：`));
        modifiedFiles.forEach((file, index) => {
            console.log(`${index + 1}. ${file}`);
        });
    } else {
        console.log(chalk.green('\n🎉 未找到任何使用 CommonJS 模块语法的文件。'));
    }
}

main().catch(error => {
    console.error(chalk.red('发生错误:'));
    console.error(error);
    process.exit(1);
});