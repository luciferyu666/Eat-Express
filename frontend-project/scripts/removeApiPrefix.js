import { storeAuthToken } from "@utils/tokenStorage";
/**
 * removeApiPrefix.js
 *
 * 使用 jscodeshift 将前端 API 请求路径中的 /api 前缀移除。
 * 例如，将 axiosInstance.get('/api/users') 或 axiosInstance.get(`/api/users/${id}`) 转换为 axiosInstance.get('/users') 或 axiosInstance.get(`/users/${id}`)。
 *
 * 日志输出将包括文件路径、修改行号、原始路径和新路径。
 */

module.exports = function(fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let fileModified = false;

    // 定义需要处理的 Axios 方法
    const axiosMethods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

    // 计数
    let matchedNodes = 0;
    let modifiedNodes = 0;

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
            try {
                const args = path.node.arguments;
                if (!args || args.length === 0) return; // 无参数则跳过

                const firstArg = args[0];
                if (!firstArg) return; // 确保 firstArg 存在

                // 仅处理字符串字面量、StringLiteral 和模板字面量的路径
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
                        const newPath = originalPath.replace(/^\/api\/?/, '/');

                        // 获取行号
                        const loc = path.node.loc;
                        const line = (loc && loc.start && loc.start.line) ? loc.start.line : '未知行号';

                        // 仅在路径发生变化时进行修改和日志记录
                        if (originalPath !== newPath) {
                            if (firstArg.type === 'Literal' || firstArg.type === 'StringLiteral') {
                                firstArg.value = newPath;
                                firstArg.raw = `"${newPath}"`; // 更新 raw 属性
                            } else if (firstArg.type === 'TemplateLiteral') {
                                // 处理模板字面量
                                firstArg.quasis.forEach(quasi => {
                                    if (quasi.value && typeof quasi.value.cooked === 'string') {
                                        quasi.value.cooked = quasi.value.cooked.replace(/^\/api\/?/, '/');
                                        quasi.value.raw = quasi.value.cooked; // 更新 raw 属性
                                    }
                                });
                            }

                            // 输出日志
                            console.log(`[removeApiPrefix] 修改文件: ${fileInfo.path} | 行: ${line} | "${originalPath}" => "${newPath}"`);
                            fileModified = true;
                            modifiedNodes += 1;
                        }
                    }
                }
            } catch (err) {
                console.error(`[removeApiPrefix] 处理文件 ${fileInfo.path} 时出错: ${err.message}`);
                // 仅输出节点类型和行号，避免循环引用
                const loc = path.node.loc;
                const line = (loc && loc.start && loc.start.line) ? loc.start.line : '未知行号';
                const nodeType = path.node.type || '未知类型';
                console.error(`当前节点类型: ${nodeType} | 行号: ${line}`);
            }
        });

    if (matchedNodes === 0) {
        console.warn(`[removeApiPrefix] 未在文件 ${fileInfo.path} 中找到匹配的节点。`);
    } else if (modifiedNodes === 0) {
        console.warn(`[removeApiPrefix] 在文件 ${fileInfo.path} 中找到匹配的节点，但未进行修改。`);
    }

    if (fileModified) {
        return root.toSource();
    } else {
        return null;
    }
};