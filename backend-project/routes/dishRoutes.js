const express = require('express');
const router = express.Router();
const Dish = require('../models/Dish');  // 引入菜品模型

// 獲取熱門菜品數據
router.get('/popular', async (req, res) => {
  try {
    // 模擬獲取熱門菜品，這裡使用 MongoDB 的查詢來返回前 10 名熱門菜品
    const hotDishes = await Dish.find().sort({ popularity: -1 }).limit(10);  // 假設數據庫中有 "popularity" 字段
    res.json(hotDishes);
  } catch (error) {
    res.status(500).json({ error: '無法獲取熱門菜品數據' });
  }
});

// 新增菜品
router.post('/add', async (req, res) => {
  const { name, price, description, category, imageUrl } = req.body;

  try {
    const newDish = new Dish({
      name,
      price,
      description,
      category,
      imageUrl
    });

    await newDish.save();
    res.json({ message: '菜品新增成功', newDish });
  } catch (error) {
    res.status(500).json({ error: '無法新增菜品' });
  }
});

// 刪除菜品
router.delete('/:dishId', async (req, res) => {
  const { dishId } = req.params;

  try {
    const deletedDish = await Dish.findByIdAndDelete(dishId);
    if (!deletedDish) {
      return res.status(404).json({ error: '菜品未找到' });
    }
    res.json({ message: '菜品已刪除', deletedDish });
  } catch (error) {
    res.status(500).json({ error: '無法刪除菜品' });
  }
});

// 更新菜品信息
router.put('/:dishId', async (req, res) => {
  const { dishId } = req.params;
  const updatedData = req.body;

  try {
    const updatedDish = await Dish.findByIdAndUpdate(dishId, updatedData, { new: true });
    if (!updatedDish) {
      return res.status(404).json({ error: '菜品未找到' });
    }
    res.json({ message: '菜品信息已更新', updatedDish });
  } catch (error) {
    res.status(500).json({ error: '無法更新菜品信息' });
  }
});

// 模擬熱門菜品數據的路由，保證前端能測試到數據
router.get('/mock-popular', (req, res) => {
  const popularDishes = [
    { id: 1, name: '麻婆豆腐', description: '經典川菜' },
    { id: 2, name: '紅燒牛肉麵', description: '美味的台灣麵食' },
  ];
  res.json(popularDishes);
});

module.exports = router;
