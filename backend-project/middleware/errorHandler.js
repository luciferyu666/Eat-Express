// backend-project/middleware/errorHandler.js

/**
 * 集中错误处理中间件
 * 
 * @param {Error} err - 捕获的错误对象
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一步中间件函数
 * 
 * @description
 * 此中间件负责集中处理应用中的所有错误。它会根据错误类型和运行环境，返回适当的错误响应给客户端。
 * 在开发环境中，还会返回详细的错误堆栈信息，以便调试。
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误堆栈信息
  console.error(err.stack);

  // 确定响应的状态码
  const statusCode = err.status || 500;

  // 初始化错误响应对象
  const response = {
    error: {
      message: err.message || '伺服器內部錯誤',
    },
  };

  // 在开发环境中，添加错误堆栈信息到响应中
  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  // 处理特定错误类型（如 Mongoose 验证错误）
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: {
        message: Object.values(err.errors).map(e => e.message).join(', '),
      },
    });
    return;
  }

  // 发送错误响应
  res.status(statusCode).json(response);
};

module.exports = errorHandler; // 导出 errorHandler 函数