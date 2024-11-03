const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');  // 假設存在 Dish 模型

// 獲取當前餐廳的所有菜品
router.get('/', async (req, res) => {
  console.log('处理 GET / 请求');
  try {
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    const menu = await Dish.find();  // 查詢所有菜品
    res.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).send('無法獲取菜單');
  }
});

// 新增菜品
router.post('/', async (req, res) => {
  console.log('处理 POST / 请求');
  const { name, price, description, category, imageUrl, promotion } = req.body;

  try {
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    const newDish = new Dish({
      name,
      price,
      description,
      category,
      imageUrl,
      promotion // 允許新增促銷字段
    });
    const savedDish = await newDish.save();  // 保存新菜品
    res.status(201).json(savedDish);
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).send('無法新增菜品');
  }
});

// 編輯菜品
router.put('/:dishId', async (req, res) => {
  console.log('处理 PUT /:dishId 请求');
  const { dishId } = req.params;
  const { name, price, description, category, imageUrl, promotion } = req.body;

  try {
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    const updatedDish = await Dish.findByIdAndUpdate(
      dishId,
      { name, price, description, category, imageUrl, promotion },  // 允許更新促銷信息
      { new: true }  // 返回更新後的菜品數據
    );
    if (!updatedDish) {
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      return res.status(404).send('菜品未找到');
    }
    res.json(updatedDish);
  } catch (error) {
    console.error('Error updating dish:', error);
    res.status(500).send('無法更新菜品');
  }
});

// 刪除菜品
router.delete('/:dishId', async (req, res) => {
  console.log('处理 DELETE /:dishId 请求');
  const { dishId } = req.params;

  try {
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    console.log("Entering routes\\menuRoutes.js");
    const deletedDish = await Dish.findByIdAndDelete(dishId);
    if (!deletedDish) {
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      console.log("Exiting routes\\menuRoutes.js with status code");
      return res.status(404).send('菜品未找到');
    }
    res.json({ message: '菜品已刪除' });
  } catch (error) {
    console.error('Error deleting dish:', error);
    res.status(500).send('無法刪除菜品');
  }
});

module.exports = router;
