// backend-project/middleware/authorize.js

/**
 * 授權中間件，根據用戶角色授予訪問權限
 * @param {Array|string} roles - 允許訪問的用戶角色列表，可以是單個角色字符串或角色字符串數組
 */
const authorize = (roles = []) => {
  // 確保 roles 是數組
  if (typeof roles === 'string') {
      roles = [roles];
  }

  return (req, res, next) => {
      if (!req.user) {
          console.warn('未認證的訪問嘗試');
          return res.status(401).json({ error: '未授權，請登入後再試' });
      }

      if (roles.length && !roles.includes(req.user.role)) {
          console.warn(`用戶角色不被授權，角色: ${req.user.role}`);
          return res.status(403).json({ error: '您沒有權限訪問此資源' });
      }

      next();
  };
};

module.exports = authorize;