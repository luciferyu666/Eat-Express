// backend-project/middleware/authorizeRoles.js

const ROLES = require('../constants/roles'); // 导入 ROLES 常量

/**
 * 授权角色中间件
 * @param  {...any} allowedRoles - 允许访问的用户角色
 * @returns {Function} - Express 中间件函数
 * @throws {Error} - 如果未指定任何允许的角色
 */
const authorizeRoles = (...allowedRoles) => {
  // 确保至少指定一个允许的角色
  if (allowedRoles.length === 0) {
    throw new Error('authorizeRoles 中间件必须至少指定一个允许的角色');
  }

  // 日志输出允许的角色
  console.info(`authorizeRoles 函数已加载，允许角色: ${allowedRoles.join(', ')}`);

  return (req, res, next) => {
    // 仅在开发环境中打印详细的用户信息
    if (process.env.NODE_ENV === 'development') {
      console.log(`authorizeRoles middleware: 用户 ID = ${req.user.userId}, 角色 = ${req.user.role}`);
    }

    // 检查用户是否已认证并且其角色在允许的角色列表中
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      const userRole = req.user && req.user.role ? req.user.role : '未定义';
      console.warn(`授权失败：用户角色 ${userRole} 无权访问此路由`);
      return res.status(403).json({ error: '您无权访问此资源' });
    }

    console.info(`授权成功：用户角色 ${req.user.role} 有权访问此路由`);
    next(); // 调用下一个中间件
  };
};

module.exports = authorizeRoles; // 将函数导出