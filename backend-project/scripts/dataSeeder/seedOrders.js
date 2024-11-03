// backend-project/scripts/seedOrders.js

const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');

const seedOrders = async () => {
  try {
    const existingOrders = await Order.countDocuments();
    if (existingOrders > 0) {
      console.log('現有訂單數量:', existingOrders);
      console.log('所有測試數據已添加');
      return;
    }

    // 查找配送員用戶
    const deliveryPerson = await User.findOne({ role: 'delivery_person' });
    if (!deliveryPerson) {
      throw new Error('未找到配送員用戶，無法創建訂單。');
    }

    const orders = [
      {
        customer: 'customerUserId', // 替換為實際的客戶用戶 ID
        deliveryPerson: deliveryPerson._id,
        restaurant: 'restaurantUserId', // 替換為實際的餐廳用戶 ID
        items: [
          {
            dish: 'dishId1', // 替換為實際的菜品 ID
            quantity: 2,
          },
          // 更多菜品...
        ],
        totalPrice: 50.0,
        status: 'pending',
        // 其他必要字段...
      },
      // 添加更多訂單...
    ];

    await Order.insertMany(orders);
    console.log('測試訂單已成功添加。');
  } catch (error) {
    console.error('添加測試訂單時發生錯誤:', error);
  }
};

module.exports = seedOrders;