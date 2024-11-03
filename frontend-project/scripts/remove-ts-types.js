import { storeAuthToken } from "@utils/tokenStorage";
/**
 * remove-ts-types.js
 *
 * 使用 jscodeshift 移除 JavaScript 文件中的 TypeScript 類型註釋。
 */

module.exports = function(fileInfo, api, options) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
  
    // 移除變量聲明中的類型註釋
    root.find(j.VariableDeclarator)
      .forEach(path => {
        if (path.node.id.typeAnnotation) {
          path.node.id.typeAnnotation = null;
        }
        if (path.node.init && path.node.init.type === 'TSTypeAssertion') {
          path.node.init = path.node.init.expression;
        }
      });
  
    // 移除函數參數和返回值中的類型註釋
    const removeFunctionTypeAnnotations = (path) => {
      path.node.params.forEach(param => {
        if (param.typeAnnotation) {
          param.typeAnnotation = null;
        }
        if (param.type === 'AssignmentPattern' && param.left.typeAnnotation) {
          param.left.typeAnnotation = null;
        }
      });
      if (path.node.returnType) {
        path.node.returnType = null;
      }
    };
  
    root.find(j.FunctionDeclaration).forEach(removeFunctionTypeAnnotations);
    root.find(j.FunctionExpression).forEach(removeFunctionTypeAnnotations);
    root.find(j.ArrowFunctionExpression).forEach(removeFunctionTypeAnnotations);
    root.find(j.ClassMethod).forEach(removeFunctionTypeAnnotations);
    root.find(j.ClassProperty).forEach(path => {
      if (path.node.typeAnnotation) {
        path.node.typeAnnotation = null;
      }
    });
  
    // 移除接口和類型別名
    root.find(j.TSTypeAliasDeclaration).remove();
    root.find(j.TSInterfaceDeclaration).remove();
    root.find(j.TSTypeParameterDeclaration).remove();
    root.find(j.TSDeclareFunction).remove();
  
    // 移除枚舉
    root.find(j.TSEnumDeclaration).remove();
  
    // 移除 import 中的類型導入
    root.find(j.ImportDeclaration)
      .forEach(path => {
        const nonTypeSpecifiers = path.node.specifiers.filter(specifier => {
          return specifier.importKind !== 'type' && specifier.importKind !== 'typeof';
        });
        path.node.specifiers = nonTypeSpecifiers;
        if (path.node.specifiers.length === 0) {
          j(path).remove();
        }
      });
  
    return root.toSource(options.printOptions);
  };