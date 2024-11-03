import { storeAuthToken } from "@utils/tokenStorage";
/**
 * replaceAxiosWithInstance.js
 *
 * 使用 jscodeshift 批量替换代码中的 `axios` 调用为 `axiosInstance`。
 *
 * 操作步骤：
 * 1. 替换导入语句中的 `axios` 为 `axiosInstance`。
 * 2. 替换所有 `axios` 调用为 `axiosInstance` 调用。
 *
 * 日志输出包括文件路径、代码行号和具体的替换操作。
 */

module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
    let fileModified = false;

    // 遍历 ImportDeclaration 节点，查找导入 axios 的语句
    root.find(j.ImportDeclaration)
        .filter(path => path.node.source.value === 'axios')
        .forEach(path => {
            const importSpecifiers = path.node.specifiers;
            importSpecifiers.forEach(specifier => {
                if (specifier.type === 'ImportDefaultSpecifier' && specifier.local.name === 'axios') {
                    // 将导入名称改为 axiosInstance
                    specifier.local.name = 'axiosInstance';
                    fileModified = true;
                    console.log(`[replaceAxiosWithInstance] 修改导入: 文件: ${fileInfo.path} | 导入名称: axios => axiosInstance`);
                }
            });
        });

    // 遍历所有 CallExpression 节点，查找 axios 调用并替换为 axiosInstance
    root.find(j.CallExpression)
        .filter(path => {
            const callee = path.node.callee;
            return (
                callee.type === 'MemberExpression' &&
                callee.object.type === 'Identifier' &&
                callee.object.name === 'axios'
            );
        })
        .forEach(path => {
            // 替换 callee.object.name 从 'axios' 到 'axiosInstance'
            path.node.callee.object.name = 'axiosInstance';
            fileModified = true;

            // 获取行号
            const loc = path.node.loc;
            const line = loc && loc.start && loc.start.line ? loc.start.line : '未知行号';

            console.log(`[replaceAxiosWithInstance] 修改调用: 文件: ${fileInfo.path} | 行: ${line} | 替换 axios 调用为 axiosInstance`);
        });

    // 如果文件被修改，返回修改后的代码
    if (fileModified) {
        return root.toSource();
    } else {
        return null;
    }
};