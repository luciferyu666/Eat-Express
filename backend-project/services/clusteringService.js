// backend-project/services/clusteringService.js

const kmeans = require('node-kmeans');

/**
 * 使用K-means聚類算法將訂單分組
 * @param {Array} orders - 訂單陣列，每個訂單包含customerLocation.coordinates
 * @param {Number} numberOfClusters - 聚類數量
 * @returns {Promise<Array>} - 聚類後的訂單分組
 */
function clusterOrders(orders, numberOfClusters) {
  const data = orders.map(order => [order.customerLocation.coordinates[0], order.customerLocation.coordinates[1]]);

  return new Promise((resolve, reject) => {
    kmeans.clusterize(data, { k: numberOfClusters }, (err, res) => {
      if (err) reject(err);
      else {
        const clusteredOrders = res.map(cluster => cluster.clusterInd.map(index => orders[index]));
        resolve(clusteredOrders);
      }
    });
  });
}

module.exports = { clusterOrders };
