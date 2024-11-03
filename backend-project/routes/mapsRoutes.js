// backend-project/routes/mapsRoutes.js

const express = require('express');
const router = express.Router();
const { handleGeocode } = require('../controllers/mapsController');

// 獲取地理位置信息
router.get('/geocode', handleGeocode);

module.exports = router;