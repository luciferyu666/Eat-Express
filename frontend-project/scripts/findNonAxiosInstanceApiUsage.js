import { storeAuthToken } from "@utils/tokenStorage";
/**
 * findNonAxiosInstanceApiUsage.js
 *
 * 使用 jscodeshift 扫描前端代码中未通过 axiosInstance 使用的 API 请求路径，
 * 并列出所有使用相对路径的前端文件中的这些 API 调用。
 *
 * 日志输出包括文件路径、行号、方法和原始 API 请求路径。
 */

module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    const matches = [];

    // 定义需要检查的 Axios 方法
    const axiosMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    // 记录导入的 axios 名称
    let axiosImportNames = [];

    // 查找 ES6 Import 导入的 axios 名称
    root.find(j.ImportDeclaration, { source: { value: 'axios' } })
        .forEach(path => {
            const specifiers = path.node.specifiers;
            if (specifiers.length > 0) {
                const defaultSpecifier = specifiers.find(s => s.type === 'ImportDefaultSpecifier');
                if (defaultSpecifier) {
                    axiosImportNames.push(defaultSpecifier.local.name);
                }
            }
        });

    // 查找 CommonJS require 导入的 axios 名称
    root.find(j.VariableDeclarator, {
        init: {
            type: 'CallExpression',
            callee: { type: 'Identifier', name: 'require' },
            arguments: [{ type: 'Literal', value: 'axios' }]
        }
    })
    .forEach(path => {
        const id = path.node.id;
        if (id.type === 'Identifier') {
            axiosImportNames.push(id.name);
        }
    });

    if (axiosImportNames.length === 0) {
        // 未找到 axios 的导入，跳过此文件
        return null;
    }

    // 遍历所有 CallExpression 节点
    root.find(j.CallExpression)
        .filter(path => {
            const callee = path.node.callee;

            // 确保 callee 是 MemberExpression
            if (callee && callee.type === 'MemberExpression') {
                const object = callee.object;
                const property = callee.property;

                if (!object || !property) {
                    return false;
                }

                // 检查 object 是否为 'axios' 的导入名称之一
                const objectName = (object.type === 'Identifier') ? object.name : null;
                if (!axiosImportNames.includes(objectName)) {
                    return false;
                }

                // 检查 property 是否为 Axios 方法之一
                if (property.type !== 'Identifier' || !axiosMethods.includes(property.name)) {
                    return false;
                }

                return true;
            }
            return false;
        })
        .forEach(path => {
            const callee = path.node.callee;
            const args = path.node.arguments;
            if (!args || args.length === 0) return; // 无参数则跳过

            const firstArg = args[0];
            if (!firstArg) return; // 确保 firstArg 存在

            // 仅处理字符串字面量和模板字面量的路径
            if (
                (firstArg.type === 'Literal' && typeof firstArg.value === 'string') ||
                (firstArg.type === 'StringLiteral' && typeof firstArg.value === 'string') ||
                firstArg.type === 'TemplateLiteral'
            ) {
                let apiPath = '';

                if (firstArg.type === 'Literal' || firstArg.type === 'StringLiteral') {
                    apiPath = firstArg.value;
                } else if (firstArg.type === 'TemplateLiteral') {
                    // 拼接模板字面量的静态部分
                    apiPath = firstArg.quasis.map(q => q.value.cooked || '').join('');
                }

                // 检查是否使用相对路径（以 '/' 开头）
                if (apiPath.startsWith('/')) {
                    // 获取行号
                    const loc = path.node.loc;
                    const line = (loc && loc.start && loc.start.line) ? loc.start.line : 'Unknown Line';

                    // 收集匹配信息
                    matches.push({
                        file: fileInfo.path,
                        line: line,
                        apiPath: apiPath,
                        method: callee.property.name
                    });
                }
            }
        });

    // 如果找到匹配，输出日志
    if (matches.length > 0) {
        matches.forEach(match => {
            console.log(`[findNonAxiosInstanceApiUsage] File: ${match.file} | Line: ${match.line} | Method: ${match.method} | "${match.apiPath}"`);
        });
    }

    // 不修改文件内容
    return null;
};