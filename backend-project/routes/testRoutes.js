// backend-project/routes/testRoutes.js

const express = require('express');
const router = express.Router();
const User = require("../models/User");

// 測試查詢外送員
router.get('/test/find-delivery-person', async (req, res) => {
  console.log('处理 GET /test/find-delivery-person 请求');
  try {
    console.log("Entering routes\\testRoutes.js");
    console.log("Entering routes\\testRoutes.js");
    const deliveryPerson = await User.findOne({ email: 'delivery1@example.com' });
    if (deliveryPerson) {
      res.status(200).json({ message: '找到外送員', deliveryPerson });
    } else {
      res.status(404).json({ message: '外送員不存在' });
    }
  } catch (error) {
    res.status(500).json({ message: '查詢錯誤', error });
  }
});

module.exports = router;