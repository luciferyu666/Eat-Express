// server.js


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io'); // 使用 Socket.IO 來實現 WebSocket 支持
const bcrypt = require('bcrypt');
const redisClient = require('./redisClient');
const { JWT_SECRET, MONGO_URI, FRONTEND_URL, PORT } = require('./config'); // 引入配置文件中的變量


// 引入模型
const User = require('./models/User');
const Order = require('./models/Order');
const DeliveryPerson = require('./models/DeliveryPerson');
const Restaurant = require('./models/Restaurant');
const Dish = require('./models/Dish');
const Notification = require('./models/Notification'); // 確保已創建 Notification 模型
const Employee = require('./models/Employee'); // 新增
const Feedback = require('./models/Feedback'); // 新增


// 創建 Express 應用
const app = express();


// 配置 CORS
app.use(cors({
  origin: FRONTEND_URL, // 使用配置中的前端地址
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));


// 使用中間件
app.use(bodyParser.json());


// 添加測試餐廳的函數
const addSampleRestaurants = async () => {
  try {
    console.log('開始添加樣本餐廳...');
    const existingRestaurants = await Restaurant.find({});
    console.log(`現有餐廳數量: ${existingRestaurants.length}`);


    if (existingRestaurants.length === 0) {
      // 模擬餐廳數據
      const sampleRestaurants = [
        {
          name: '美味餐廳 1',
          address: '北投區美食街1號',
          phone: '02-1234-5671',
          status: 'active',
          location: {
            type: 'Point',
            coordinates: [121.497658, 25.131104],
          },
          sample: true, // 添加標識符
        },
        {
          name: '美味餐廳 2',
          address: '北投區美食街2號',
          phone: '02-1234-5672',
          status: 'active',
          location: {
            type: 'Point',
            coordinates: [121.496658, 25.130104],
          },
          sample: true,
        },
        // 添加更多樣本餐廳...
      ];


      const createdRestaurants = await Restaurant.insertMany(sampleRestaurants);
      console.log('樣本餐廳添加成功');


      // 為每個餐廳添加一個測試菜品
      for (const restaurant of createdRestaurants) {
        console.log(`為餐廳 ${restaurant.name} 添加測試菜品...`);
        const testDish = new Dish({
          name: '招牌菜',
          description: '美味可口的招牌菜',
          price: 200,
          imageUrl: 'http://example.com/dish.jpg',
        });
        await testDish.save();
        console.log(`菜品 ${testDish.name} 創建成功`);


        // 將菜品添加到餐廳菜單
        restaurant.menu.push(testDish._id);
        await restaurant.save();
        console.log(`菜品 ${testDish.name} 添加到餐廳 ${restaurant.name} 菜單`);
      }


      console.log('測試菜品已添加到樣本餐廳');
    } else {
      console.log('樣本餐廳已存在，跳過插入。');
    }
  } catch (error) {
    console.error('添加樣本餐廳時發生錯誤:', error);
  }
};


// 修改 addTestOrders 函數，調用 addSampleRestaurants
const addTestOrders = async () => {
  try {
    // 調用添加餐廳的函數
    await addSampleRestaurants();


    // 檢查是否已經有測試訂單
    const existingOrders = await Order.find({});
    console.log(`現有訂單數量: ${existingOrders.length}`);


    if (existingOrders.length === 0) {
      // 獲取一個測試用戶
      let testUser = await User.findOne({ email: 'testuser@example.com' });
      if (!testUser) {
        // 創建測試用戶
        testUser = new User({
          username: 'Test User',
          email: 'testuser@example.com',
          password: await bcrypt.hash('password123', 10),
          role: 'customer',
        });
        await testUser.save();
        console.log('測試用戶創建成功');
      } else {
        console.log('測試用戶已存在');
      }


      // 獲取所有餐廳
      const restaurants = await Restaurant.find({});
      console.log(`找到的餐廳數量: ${restaurants.length}`);


      // 為每個餐廳創建測試訂單
      for (const restaurant of restaurants) {
        if (restaurant.menu.length > 0) {
          await Order.create({
            userId: testUser._id,
            restaurant: restaurant._id,
            status: 'active',
            items: [{ dish: restaurant.menu[0], quantity: 2 }],
            paymentMethod: 'credit_card',
            restaurantAddress: restaurant.address,
            customerLng: restaurant.location.coordinates[0] + 0.001,
            customerLat: restaurant.location.coordinates[1] + 0.001,
            deliveryAddress: '客戶地址',
          });
          console.log(`為餐廳 ${restaurant.name} 創建訂單`);
        } else {
          console.warn(`餐廳 ${restaurant.name} 沒有菜單項目，跳過訂單創建。`);
        }
      }


      console.log('測試訂單添加成功');
    } else {
      console.log('測試訂單已存在，跳過創建。');
    }


    // 檢查餐廳數量
    await checkRestaurants();
  } catch (error) {
    console.error('添加測試訂單時發生錯誤:', error);
  }
};


// 檢查餐廳集合中的文檔數量
const checkRestaurants = async () => {
  try {
    const count = await Restaurant.countDocuments();
    console.log(`餐廳集合中的文檔數量: ${count}`);
  } catch (error) {
    console.error('檢查餐廳集合失敗:', error);
  }
};


// 連接 MongoDB 並添加測試數據
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    console.log(`使用的資料庫名稱: ${mongoose.connection.db.databaseName}`);
    addTestOrders(); // 在連接 MongoDB 後插入測試數據
  })
  .catch((error) => console.error('MongoDB connection error:', error));


// 創建 HTTP 服務器
const server = http.createServer(app);


// 創建 Socket.IO 服務器並綁定到同一 HTTP 服務器上，並啟用 CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});


// 定義 /orders 命名空間
const ordersNamespace = io.of('/orders');


// 引入並使用身份驗證中間件
const authenticateSocket = require('./middleware/authenticateSocket');
ordersNamespace.use(authenticateSocket);


// 在 /orders 命名空間中處理連接
ordersNamespace.on('connection', (socket) => {
  console.log(`用戶 ${socket.user.userId} 連接到 /orders 命名空間`);


  // 客戶端訂閱訂單狀態更新的事件
  socket.on('joinOrderRoom', ({ orderId }) => {
    socket.join(`order_${orderId}`);
    console.log(`用戶 ${socket.user.userId} 加入訂單房間: order_${orderId}`);
  });


  socket.on('leaveOrderRoom', ({ orderId }) => {
    socket.leave(`order_${orderId}`);
    console.log(`用戶 ${socket.user.userId} 離開訂單房間: order_${orderId}`);
  });


  // 監聽來自客戶端的其他消息事件
  socket.on('message', (data) => {
    console.log(`收到客戶端的消息: ${data}`);
    ordersNamespace.emit('message', `服務器已收到消息: ${data}`);
  });


  // 訂單狀態更新的事件
  socket.on('updateOrderStatus', async ({ orderId, status, deliveryLocation }) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        socket.emit('error', '訂單不存在');
        return;
      }


      order.status = status;
      if (deliveryLocation) {
        order.deliveryLocation = deliveryLocation;
      }
      await order.save();


      // 發送更新到訂單房間
      ordersNamespace.to(`order_${orderId}`).emit('orderStatusUpdate', { orderId, status, deliveryLocation });
      console.log(`訂單 ${orderId} 狀態更新為: ${status}`);
    } catch (error) {
      console.error('更新訂單狀態失敗:', error);
      socket.emit('error', '更新訂單狀態失敗');
    }
  });


  // 當客戶端斷開連接
  socket.on('disconnect', (reason) => {
    console.log(`用戶 ${socket.user.userId} 斷開連接。原因: ${reason}`);
  });
});


// 基本的 API 路徑，用於測試服務器運行狀態
app.get('/', (req, res) => {
  res.send('Hello, backend is running!');
});


// 引入各種路由
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const earningsRoutes = require('./routes/earningsRoutes');
const userRoutes = require('./routes/userRoutes');
const deliveryPersonRoutes = require('./routes/deliveryPersonRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const menuRoutes = require('./routes/menuRoutes');


// 設置 API 路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurants', restaurantRoutes); // 確保路徑是複數
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/delivery-persons', deliveryPersonRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery/earnings', earningsRoutes);
app.use('/api', deliveryRoutes);
app.use('/api/restaurants/menu', menuRoutes);


// 獲取所有活躍的外送員位置（新增的路由）
app.get('/api/delivery-persons/locations', async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find({}).select('location');
    res.status(200).json(deliveryPersons);
  } catch (error) {
    console.error('獲取外送員位置失敗:', error);
    res.status(500).json({ error: '獲取外送員位置失敗' });
  }
});


// 捕獲所有路徑的通配符路由，確保它在所有具體路由的後面
app.use('*', (req, res) => {
  res.status(404).json({ error: '路由不存在' });
});


// 啟動服務器
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});