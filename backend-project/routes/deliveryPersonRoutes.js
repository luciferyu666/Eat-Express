// routes/deliveryPersonRoutes.js
const express = require('express');
const DeliveryPerson = require('../models/DeliveryPerson'); // 確保這行導入是正確的
const router = express.Router();

// 獲取所有外送員列表
router.get('/', async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find();
    res.json(deliveryPersons);
  } catch (error) {
    res.status(500).json({ error: '無法獲取外送員列表', details: error.message });
  }
});

// 根據 ID 獲取單一外送員的詳細信息
router.get('/:personId', async (req, res) => {
  const { personId } = req.params;
  try {
    const deliveryPerson = await DeliveryPerson.findById(personId);
    if (!deliveryPerson) {
      return res.status(404).json({ error: '外送員未找到' });
    }
    res.json(deliveryPerson);
  } catch (error) {
    res.status(500).json({ error: '無法獲取外送員信息', details: error.message });
  }
});

// 更新外送員信息
router.put('/:personId', async (req, res) => {
  const { personId } = req.params;
  const updatedData = req.body;

  try {
    const deliveryPerson = await DeliveryPerson.findByIdAndUpdate(personId, updatedData, { new: true });
    if (!deliveryPerson) {
      return res.status(404).json({ error: '外送員未找到' });
    }
    res.json({ message: '外送員信息已更新', deliveryPerson });
  } catch (error) {
    res.status(500).json({ error: '無法更新外送員信息', details: error.message });
  }
});

// 禁用外送員
router.put('/:personId/disable', async (req, res) => {
  const { personId } = req.params;

  try {
    const deliveryPerson = await DeliveryPerson.findById(personId);
    if (!deliveryPerson) {
      return res.status(404).json({ error: '外送員未找到' });
    }

    deliveryPerson.availability = false; // 將外送員的可用狀態設置為不可用
    await deliveryPerson.save();
    res.json({ message: '外送員已禁用', deliveryPerson });
  } catch (error) {
    res.status(500).json({ error: '無法禁用外送員', details: error.message });
  }
});

// 啟用外送員
router.put('/:personId/enable', async (req, res) => {
  const { personId } = req.params;

  try {
    const deliveryPerson = await DeliveryPerson.findById(personId);
    if (!deliveryPerson) {
      return res.status(404).json({ error: '外送員未找到' });
    }

    deliveryPerson.availability = true; // 將外送員的可用狀態設置為可用
    await deliveryPerson.save();
    res.json({ message: '外送員已啟用', deliveryPerson });
  } catch (error) {
    res.status(500).json({ error: '無法啟用外送員', details: error.message });
  }
});

// 获取所有外送员的位置
router.get('/locations', async (req, res) => {
  try {
    const deliveryPersons = await DeliveryPerson.find({}).select('location');
    res.status(200).json(deliveryPersons);
  } catch (error) {
    console.error('获取外送员位置失败:', error);
    res.status(500).json({ error: '获取外送员位置失败' });
  }
});

module.exports = router;
