import { storeAuthToken } from "@utils/tokenStorage";
/**
 * findApiPrefix.js
 *
 * 使用 jscodeshift 扫描前端代码中 axios 或 axiosInstance 的 API 请求路径，
 * 并列出所有包含额外的 /api 前缀的文件。
 *
 * 日志输出包括文件路径、行号和原始路径。
 */

module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    const matches = [];

    // 定义需要检查的 Axios 方法
    const axiosMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    // 遍历所有 CallExpression 节点
    root.find(j.CallExpression)
        .filter(path => {
            const callee = path.node.callee;
            if (callee && callee.type === 'MemberExpression') {
                const object = callee.object;
                const property = callee.property;

                if (!object || !property) {
                    return false;
                }

                // 检查 object 是否为 'axiosInstance' 或 'axios'
                const objectName = (object.type === 'Identifier') ? object.name : null;
                if (!objectName || (objectName !== 'axiosInstance' && objectName !== 'axios')) {
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
                let originalPath = '';

                if (firstArg.type === 'Literal' || firstArg.type === 'StringLiteral') {
                    originalPath = firstArg.value;
                } else if (firstArg.type === 'TemplateLiteral') {
                    // 拼接模板字面量的静态部分
                    originalPath = firstArg.quasis.map(q => q.value.cooked || '').join('');
                }

                // 检查是否以 '/api' 开头
                if (originalPath.startsWith('/api')) {
                    // 获取行号
                    const loc = path.node.loc;
                    const line = (loc && loc.start && loc.start.line) ? loc.start.line : '未知行号';

                    // 收集匹配信息
                    matches.push({
                        file: fileInfo.path,
                        line: line,
                        originalPath: originalPath
                    });
                }
            }
        });

    // 如果找到匹配，输出日志
    if (matches.length > 0) {
        matches.forEach(match => {
            console.log(`[findApiPrefix] 文件: ${match.file} | 行: ${match.line} | "${match.originalPath}"`);
        });
    }

    // 不修改文件内容
    return null;
};