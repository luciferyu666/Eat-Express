// routes/restaurantRoutes.js


const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const verifyToken = require('../middleware/verifyToken'); // 引入驗證中間件
const restaurantController = require('../controllers/restaurantController');
const authController = require('../controllers/authController');


// 引入已創建的 Redis 客戶端
const redisClient = require('../redisClient');  // 根據您的項目結構調整路徑


// 熱門餐廳查詢 API，帶有 Redis 快取邏輯
router.get('/popular', async (req, res) => {
  try {
    // 檢查 Redis 快取是否存在
    const cacheResults = await redisClient.get('popularRestaurants');
    if (cacheResults) {
      // Redis 中存在快取，直接返回
      return res.json(JSON.parse(cacheResults));
    } else {
      // Redis 中不存在快取，查詢 MongoDB
      const popularRestaurants = await Restaurant.find().sort({ rating: -1 }).limit(10);
      // 存儲到 Redis，設置有效期為 5 分鐘（300 秒）
      await redisClient.setEx('popularRestaurants', 300, JSON.stringify(popularRestaurants));
      res.json(popularRestaurants);
    }
  } catch (error) {
    console.error('無法獲取熱門餐廳:', error);
    res.status(500).json({ error: '無法獲取熱門餐廳' });
  }
});


// 更新的路由: 獲取附近餐廳
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: '缺少必要的查詢參數' });
    }


    const userLatitude = parseFloat(lat);
    const userLongitude = parseFloat(lng);
    const searchRadius = parseFloat(radius);


    // 使用 MongoDB 的地理空間查詢
    const restaurants = await Restaurant.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [userLongitude, userLatitude], // 經度在前，緯度在後
          },
          $maxDistance: searchRadius, // 距離範圍（單位：米）
        },
      },
    });


    res.status(200).json(restaurants);
  } catch (error) {
    console.error('獲取附近餐廳失敗:', error);
    res.status(500).json({ error: '獲取附近餐廳失敗' });
  }
});


// 根據地理位置篩選餐廳（已整合到 /nearby 路由中，可選擇移除此路由）
router.get('/location', async (req, res) => {
  const { lat, lng } = req.query;


  try {
    if (lat && lng) {
      // 使用 MongoDB 的地理位置查詢
      const restaurants = await Restaurant.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: 5000, // 距離範圍：5000米內
          },
        },
      });
      res.json(restaurants);
    } else {
      res.status(400).json({ error: '缺少經緯度參數' });
    }
  } catch (error) {
    console.error('無法根據位置篩選餐廳:', error);
    res.status(500).json({ error: '無法根據位置篩選餐廳' });
  }
});


// 獲取指定餐廳的菜單
router.get('/:restaurantId/menu', async (req, res) => {
  const { restaurantId } = req.params;


  try {
    // 找到指定餐廳，並通過 populate 加載 menu 參照
    const restaurant = await Restaurant.findById(restaurantId).populate('menu');
    if (!restaurant) {
      return res.status(404).json({ error: '餐廳未找到' });
    }


    // 返回餐廳的菜單
    res.json(restaurant.menu);
  } catch (error) {
    console.error('無法獲取餐廳菜單:', error);
    res.status(500).json({ error: '無法獲取餐廳菜單' });
  }
});


// 獲取所有餐廳列表
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    console.error('無法獲取餐廳列表:', error);
    res.status(500).json({ error: '無法獲取餐廳列表' });
  }
});


// 新增餐廳（需要身份驗證）
router.post('/add', verifyToken, async (req, res) => {
  const { name, address, rating, menu, phone, status, location } = req.body;


  try {
    const newRestaurant = new Restaurant({
      name,
      address,
      rating,
      menu,
      phone,
      status,
      location,
    });


    await newRestaurant.save();
    // 清除 Redis 中的熱門餐廳快取
    await redisClient.del('popularRestaurants');


    res.json({ message: '餐廳新增成功', newRestaurant });
  } catch (error) {
    console.error('無法新增餐廳:', error);
    res.status(500).json({ error: '無法新增餐廳' });
  }
});


// 更新餐廳信息（需要身份驗證）
router.put('/:restaurantId', verifyToken, async (req, res) => {
  const { restaurantId } = req.params;
  const updatedData = req.body;


  try {
    const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, updatedData, { new: true });
    if (!restaurant) {
      return res.status(404).json({ error: '餐廳未找到' });
    }


    // 清除 Redis 中的熱門餐廳快取，以保證數據一致性
    await redisClient.del('popularRestaurants');


    res.json({ message: '餐廳信息已更新', restaurant });
  } catch (error) {
    console.error('無法更新餐廳信息:', error);
    res.status(500).json({ error: '無法更新餐廳信息' });
  }
});


// 禁用餐廳（需要身份驗證）
router.put('/:restaurantId/disable', verifyToken, async (req, res) => {
  const { restaurantId } = req.params;


  try {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: '餐廳未找到' });
    }


    restaurant.status = 'disabled';
    await restaurant.save();


    // 清除 Redis 中的熱門餐廳快取
    await redisClient.del('popularRestaurants');


    res.json({ message: '餐廳已禁用', restaurant });
  } catch (error) {
    console.error('無法禁用餐廳:', error);
    res.status(500).json({ error: '無法禁用餐廳' });
  }
});


// 获取餐厅表现数据的路由
router.get('/restaurant-performance', async (req, res) => {
  try {
    // 对餐厅的表現进行一些统计
    const restaurantData = await Restaurant.aggregate([
      {
        $lookup: {
          from: 'orders', // 连接 orders 集合
          localField: '_id',
          foreignField: 'restaurant',
          as: 'orders',
        },
      },
      {
        $project: {
          name: 1,
          totalOrders: { $size: '$orders' },
          averageRating: { $avg: '$orders.rating' }, // 假设订单中有评价
          totalRevenue: { $sum: '$orders.totalPrice' }, // 假设订单中有总价
        },
      },
    ]);


    res.status(200).json(restaurantData);
  } catch (error) {
    console.error('获取餐厅表现数据失败:', error);
    res.status(500).json({ error: '无法获取餐厅表现数据' });
  }
});


// 新增的路由
// 獲取餐廳資料
router.get('/profile/:id', verifyToken, restaurantController.getRestaurantProfile);


// 獲取銷售數據
router.get('/sales/:id', verifyToken, restaurantController.getSalesData);


// 獲取通知
router.get('/notifications/:id', verifyToken, restaurantController.getNotifications);


// 獲取員工數據
router.get('/employees/:id', verifyToken, restaurantController.getEmployees);


// 獲取餐廳基本資料的路由（需要身份驗證）
router.get('/profile', authController.verifyToken, restaurantController.getRestaurantProfile);


module.exports = router;