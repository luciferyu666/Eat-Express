// backend-project/services/reportService.js

const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const getSystemReport = async () => {
  // 獲取總訂單量和總收入
  const orders = await Order.find({});
  const orderCounts = ['Pending', 'In Progress', 'Delivered', 'Completed'].map(status => 
    orders.filter(order => order.status === status).length
  );
  const revenues = ['Pending', 'In Progress', 'Delivered', 'Completed'].map(status => 
    orders
      .filter(order => order.status === status)
      .reduce((total, order) => total + order.totalPrice, 0)
  );

  return { labels: ['Pending', 'In Progress', 'Delivered', 'Completed'], orderCounts, revenues };
};

const getUserBehaviorReport = async () => {
  // 獲取活躍用戶數
  const activeUsers = await User.countDocuments({ isActive: true });
  
  // 其他用戶行為數據
  // ...
  
  return { labels: ['Jan', 'Feb', 'Mar', 'Apr'], activeUsers: [100, 150, 200, 250] };
};

const getRestaurantPerformanceReport = async () => {
  // 獲取各餐廳的表現數據
  const restaurants = await Restaurant.find({});
  const labels = restaurants.map(r => r.name);
  const performanceData = restaurants.map(r => r.orderCount);

  return { labels, performanceData };
};

module.exports = {
  getSystemReport,
  getUserBehaviorReport,
  getRestaurantPerformanceReport,
};
