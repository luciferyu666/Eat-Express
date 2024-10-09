// backend-project/controllers/restaurantController.js

const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Employee = require('../models/Employee'); // 確保 Employee 模型存在
const User = require('../models/User');


// 獲取餐廳資料
exports.getRestaurantProfile = async (req, res) => {
  console.log('getRestaurantProfile 被調用');
  try {
    // 使用 Token 中的 userId 查找對應的餐廳用戶
    const restaurant = await User.findById(req.userId);

    // 檢查該用戶是否存在且角色為 "restaurant"
    if (!restaurant || restaurant.role !== 'restaurant') {
      return res.status(404).json({ error: '找不到餐廳資料' });
    }

    // 返回餐廳基本資料
    const { username, email, address, contact } = restaurant;
    res.status(200).json({
      name: username,
      email,
      address,
      contact,
    });
  } catch (error) {
    console.error('獲取餐廳資料失敗:', error);
    res.status(500).json({ error: '獲取餐廳資料失敗，請稍後再試' });
  }
};


// 獲取銷售數據
exports.getSalesData = async (req, res) => {
  console.log('getSalesData 被調用');
  try {
    const orders = await Order.find({ restaurant: req.params.id, status: 'completed' });
    const sales = orders.reduce((total, order) => total + order.totalAmount, 0);
    res.status(200).json({ sales });
  } catch (error) {
    console.error('獲取銷售數據時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤', error });
  }
};


// 獲取通知
exports.getNotifications = async (req, res) => {
  console.log('getNotifications 被調用');
  try {
    const notifications = await Notification.find({ restaurant: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('獲取通知時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤', error });
  }
};


// 獲取員工數據
exports.getEmployees = async (req, res) => {
  console.log('getEmployees 被調用');
  try {
    const employees = await Employee.find({ restaurant: req.params.id });
    res.status(200).json(employees);
  } catch (error) {
    console.error('獲取員工數據時發生錯誤:', error);
    res.status(500).json({ message: '伺服器錯誤', error });
  }
};