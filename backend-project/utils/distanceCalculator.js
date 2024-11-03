// backend-project/utils/distanceCalculator.js

const axios = require('axios');

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * 計算距離和持續時間
 * @param {String} origins - 起點地址
 * @param {Array<String>} destinations - 目的地地址陣列
 * @returns {Array<Object>} - 每個目的地的距離和持續時間
 */
async function getDistanceAndDuration(origins, destinations) {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations.join('|'))}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    const results = data.rows[0].elements.map(element => {
      if (element.status === 'OK') {
        return {
          distance: element.distance.value, // meters
          duration: element.duration.value, // seconds
        };
      } else {
        return {
          distance: Infinity,
          duration: Infinity,
        };
      }
    });

    return results;
  } catch (error) {
    console.error('Error fetching distance matrix:', error);
    return [];
  }
}

module.exports = { getDistanceAndDuration };
