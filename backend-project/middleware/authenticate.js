// middleware/authenticate.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // 引用配置文件中的 JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in configuration');
}

// JWT 驗證中間件
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7); // 去掉 'Bearer ' 前綴
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT 驗證錯誤:', err.message);
        return res.status(401).json({ error: '無效的 Token' });
      }
      req.user = decoded;
      next();
    });
  } else {
    console.error('沒有提供 JWT Token');
    return res.status(401).json({ error: '沒有提供 Token' });
  }
};

module.exports = authenticate;