// src/controllers/dishController.js

const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant'); // 确保导入 Restaurant 模型
// const logger = require('../utils/logger');

/**
 * 获取热门菜品
 */
exports.getPopularDishes = async (req, res) => {
  console.log("Entering getPopularDishes with parameters: req, res");
  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    // 实现获取热门菜品的逻辑，例如按销量排序
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const dishes = await Dish.find()
      .sort({ sales: -1 }) // 假设您在 Dish 模型中有 sales 字段
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, data: dishes });
  } catch (err) {
    console.error("Error in getPopularDishes:", err);
    console.error("Error in getPopularDishes:", err);
    console.error('获取热门菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};

/**
 * 模拟热门菜品数据
 */
exports.getMockPopularDishes = async (req, res) => {
  console.log("Entering getMockPopularDishes with parameters: req, res");
  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    // 返回一些模拟的数据
    const mockData = [
      { name: 'Mock Dish 1', price: 10 },
      { name: 'Mock Dish 2', price: 20 },
      // 添加更多模拟数据
    ];
    res.status(200).json({ success: true, data: mockData });
  } catch (err) {
    console.error("Error in getMockPopularDishes:", err);
    console.error("Error in getMockPopularDishes:", err);
    console.error('获取模拟热门菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};

/**
 * 新增菜品
 */
exports.addDish = async (req, res) => {
  console.log("Entering addDish with parameters: req, res");
  const { name, description, price, category, imageUrl } = req.body;
  const restaurantId = req.user.restaurant; // 假设您在身份验证中添加了用户的 restaurant 信息

  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    const newDish = new Dish({
      name,
      description,
      price,
      category,
      imageUrl,
      restaurant: restaurantId,
    });

    const dish = await newDish.save();

    // 更新餐厅的菜单（如果需要）
    await Restaurant.findByIdAndUpdate(restaurantId, { $push: { menu: dish._id } });

    res.status(201).json({ success: true, data: dish });
  } catch (err) {
    console.error("Error in addDish:", err);
    console.error("Error in addDish:", err);
    console.error('新增菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};

/**
 * 获取单个菜品
 */
exports.getDishById = async (req, res) => {
  console.log("Entering getDishById with parameters: req, res");
  const { id } = req.params;

  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    const dish = await Dish.findById(id).populate('restaurant', 'name address');
    if (!dish) {
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting getDishById with return value: value");
      return res.status(404).json({ msg: '菜品未找到' });
    }
    res.json(dish);
  } catch (err) {
    console.error("Error in getDishById:", err);
    console.error('获取菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};

/**
 * 更新菜品
 */
exports.updateDish = async (req, res) => {
  console.log("Entering updateDish with parameters: req, res");
  const { id } = req.params;
  const { name, description, price, category, imageUrl } = req.body;

  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    let dish = await Dish.findById(id);
    if (!dish) {
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting updateDish with return value: value");
      return res.status(404).json({ msg: '菜品未找到' });
    }

    dish.name = name || dish.name;
    dish.description = description || dish.description;
    dish.price = price || dish.price;
    dish.category = category || dish.category;
    dish.imageUrl = imageUrl || dish.imageUrl;

    await dish.save();
    res.json(dish);
  } catch (err) {
    console.error("Error in updateDish:", err);
    console.error('更新菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};

/**
 * 删除菜品
 */
exports.deleteDish = async (req, res) => {
  console.log("Entering deleteDish with parameters: req, res");
  const { id } = req.params;

  try {
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    console.log("Entering controllers\\dishController.js");
    const dish = await Dish.findById(id);
    if (!dish) {
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting controllers\\dishController.js with status code");
      console.log("Exiting deleteDish with return value: value");
      return res.status(404).json({ msg: '菜品未找到' });
    }

    // 从餐厅菜单中移除（如果需要）
    await Restaurant.findByIdAndUpdate(dish.restaurant, { $pull: { menu: dish._id } });

    await dish.remove();
    res.json({ msg: '菜品已删除' });
  } catch (err) {
    console.error("Error in deleteDish:", err);
    console.error('删除菜品失败:', err);
    res.status(500).send('服务器错误');
  }
};