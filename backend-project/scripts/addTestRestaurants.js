// backend/scripts/addTestRestaurants.js

const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addTestRestaurants = async () => {
  try {
    await Restaurant.deleteMany({});

    const restaurants = [
      {
        name: '餐廳 A',
        description: '一家附近的餐廳',
        address: '地址 A',
        distance: 1200,
        location: {
          type: 'Point',
          coordinates: [121.5645, 25.0340], // [lng, lat]
        },
      },
      {
        name: '餐廳 B',
        description: '另一家附近的餐廳',
        address: '地址 B',
        distance: 2300,
        location: {
          type: 'Point',
          coordinates: [121.5650, 25.0360],
        },
      },
      // 添加更多測試餐廳...
    ];

    await Restaurant.insertMany(restaurants);
    console.log('測試餐廳已添加');
    mongoose.connection.close();
  } catch (error) {
    console.error('添加測試餐廳失敗:', error);
    mongoose.connection.close();
  }
};

addTestRestaurants();
