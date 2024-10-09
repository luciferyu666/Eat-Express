const express = require('express');
const router = express.Router();
const googleMapsClient = require('../services/maps');

// 地理編碼 API 路由
router.post('/geocode', (req, res) => {
  const { address } = req.body;

  googleMapsClient.geocode({ address })
    .asPromise()
    .then((response) => {
      res.send(response.json.results);
    })
    .catch((err) => {
      res.status(500).send({ error: err.message });
    });
});

module.exports = router;