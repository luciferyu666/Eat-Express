// backend-project/server.js

require('express-async-errors'); // 自动捕获异步错误
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const rfs = require('rotating-file-stream');
const cookieParser = require('cookie-parser');

const { MONGO_URI, FRONTEND_URL, PORT, NODE_ENV, ALLOWED_ORIGINS, JWT_SECRET } = require('./config');
const { ROLES } = require('./utils/constants');

// 导入模型
const User = require('./models/User');
const Order = require('./models/Order');
const Restaurant = require('./models/Restaurant');
const Dish = require('./models/Dish');
const NotificationModel = require('./models/Notification');
const Employee = require('./models/Employee');
const Feedback = require('./models/Feedback');

// 导入路由
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const userRoutes = require('./routes/userRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const menuRoutes = require('./routes/menuRoutes');
const deliveryPersonRoutes = require('./routes/deliveryPersonRoutes');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');

// 创建 Express 应用
const app = express();

// 创建 HTTP 服务器
const server = http.createServer(app);

// 使用 Cookie Parser
app.use(cookieParser());

// 配置中间件

// 安全性中间件
app.use(helmet());

// 压缩中间件
app.use(compression());

// 设置信任代理
app.set('trust proxy', 1);

// 请求日志中间件
if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  const logDirectory = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  const accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    size: '10M',
    compress: 'gzip',
    path: logDirectory,
  });

  app.use(morgan('combined', { stream: accessLogStream }));
}

// 限流中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 个请求
  message: '请求过于频繁，请稍后再试。',
});
app.use(limiter);

// CORS 中间件
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 解析 JSON 请求体
app.use(express.json());

// 解析 URL 编码请求体
app.use(express.urlencoded({ extended: true }));

// 同步模型索引
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ 已连接到 MongoDB');
    console.log(`📦 使用的数据库名称: ${mongoose.connection.db.databaseName}`);
    try {
      await Promise.all([
        User.syncIndexes(),
        Order.syncIndexes(),
        Restaurant.syncIndexes(),
        Dish.syncIndexes(),
        NotificationModel.syncIndexes(),
        Employee.syncIndexes(),
        Feedback.syncIndexes(),
      ]);
      console.log('✅ 所有模型索引同步完成');
    } catch (indexError) {
      console.error('❌ 模型索引同步失败:', indexError);
    }

    // 根路由
    app.get('/', (req, res) => {
      console.log('📍 根路由被访问');
      res.send('Hello, backend is running!');
    });

    // 设置 API 路由
    app.use('/api/auth', authRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/restaurant', restaurantRoutes);
    app.use('/api/dish', dishRoutes);
    app.use('/api/order', orderRoutes);
    app.use('/api/report', reportRoutes);
    app.use('/api/notification', notificationRoutes);
    app.use('/api/payment', paymentRoutes);
    app.use('/api/delivery-earning', earningsRoutes);
    app.use('/api/delivery', deliveryRoutes);
    app.use('/api/restaurant/menu', menuRoutes);
    app.use('/api/delivery-person', deliveryPersonRoutes);

    // 捕获所有不存在的路由
    app.use('*', (req, res) => {
      console.warn(`⚠️ 路由不存在: ${req.originalUrl}`);
      res.status(404).json({ error: '路由不存在' });
    });

    // 集中式错误处理中间件
    app.use(errorHandler);

    // 初始化 Socket.IO
    const { initializeSocket } = require('./socket');
    initializeSocket(server);

    // 启动服务器
    server.listen(PORT, () => {
      if (NODE_ENV !== 'production') {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log('📂 Registered routes:');
        const listEndpoints = require('express-list-endpoints');
        console.log(listEndpoints(app));
      } else {
        console.info(`🚀 Server is running on port ${PORT}`);
      }
    });
  })
  .catch((error) => {
    console.error(`❌ MongoDB 连接错误: ${error.message}`);
    process.exit(1);
  });

// 捕捉未处理的异常和拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('❗️ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

process.on('uncaughtException', (error) => {
  console.error('❗️ Uncaught Exception:', error);
  shutdown(); // 优雅关闭服务器
});

// 优雅关闭服务器
const shutdown = () => {
  console.log('🔄 收到关闭信号，正在关闭服务器...');
  server.close(() => {
    console.log('🛑 HTTP 服务器已关闭');
    mongoose.connection.close(false, () => {
      console.log('🛑 MongoDB 连接已关闭');
      // 断开 Socket.IO 连接
      const { io } = require('./socket');
      io.close(() => {
        console.log('🛑 Socket.IO 连接已关闭');
        process.exit(0);
      });
    });
  });

  // 如果在 10 秒内未完成，强制关闭
  setTimeout(() => {
    console.error('⚠️ 强制关闭服务器');
    process.exit(1);
  }, 10000);
};

// 将 app 和 server 导出以供其他模块使用
module.exports = { app, server };