// backend-project/controllers/mapsController.js

const { getGeocode } = require('../services/mapsService');

/**
 * 處理地理位置信息請求
 */
const handleGeocode = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: '地址參數是必需的' });
  }

  try {
    console.log("Entering controllers\\mapsController.js");
    console.log("Entering controllers\\mapsController.js");
    console.log("Entering controllers\\mapsController.js");
    console.log("Entering controllers\\mapsController.js");
    const geocodeData = await getGeocode(address);
    res.json(geocodeData);
  } catch (error) {
    res.status(500).json({ error: '獲取地理位置信息失敗' });
  }
};

module.exports = {
  handleGeocode,
};