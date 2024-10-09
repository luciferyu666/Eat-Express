// backend/socket.js

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const server = require('./server'); // 确保您有一个 HTTP 服务器实例
const { JWT_SECRET, FRONTEND_URL } = require('./config'); // 引入配置文件中的變量

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL, // 使用配置中的前端地址
    methods: ['GET', 'POST'],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      if (!JWT_SECRET) {
        throw new Error('JWT_SECRET 未设置');
      }

      // 如果 Token 前有 'Bearer ' 前缀，去掉它
      const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;

      // 验证 Token
      const decoded = jwt.verify(tokenValue, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      console.error('Token 验证失败:', err);
      next(new Error('验证失败'));
    }
  } else {
    next(new Error('无 Token'));
  }
});

io.on('connection', (socket) => {
  console.log('一个用户连接了:', socket.user);

  socket.on('joinOrderRoom', ({ orderId }) => {
    socket.join(`order_${orderId}`);
    console.log(`用户加入订单房间: order_${orderId}`);
  });

  socket.on('leaveOrderRoom', ({ orderId }) => {
    socket.leave(`order_${orderId}`);
    console.log(`用户离开订单房间: order_${orderId}`);
  });

  // 其他事件处理
});

module.exports = io; // 如果需要在其他地方使用 io 实例