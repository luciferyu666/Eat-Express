// backend-project/services/routeOptimizationService.js

const Order = require('../models/Order');
const User = require('../models/User'); // 修改这里
const { getDistanceAndDuration } = require('../utils/distanceCalculator');

/**
 * 蚁群算法路径优化服务
 * @param {Object} deliveryPerson - 外送员对象（User 模型实例，role 为 'delivery_person'）
 * @param {Array} orders - 分配给外送员的订单数组
 * @returns {Object} - 最优路径及其距离和时间
 */
async function optimizeRoute(deliveryPerson, orders) {
  // 获取所有配送点（餐厅和客户）
  const locations = await Promise.all(orders.map(async (order) => {
    // 获取餐厅和客户的位置
    const restaurant = await order.populate('restaurant').execPopulate();
    const customer = await order.populate('customer').execPopulate();
    return {
      restaurant: restaurant.restaurant.location.coordinates,
      customer: customer.customerLocation.coordinates,
    };
  }));

  // 生成所有需要访问的点
  const points = [];
  locations.forEach((loc) => {
    points.push(loc.restaurant); // 餐厅位置
    points.push(loc.customer);   // 客户位置
  });

  // 添加起点（外送员当前位置）
  const startPoint = deliveryPerson.currentLocation.coordinates;

  // 将起点添加到 points 数组的起始位置
  points.unshift(startPoint);

  // 以下为蚁群算法的实现，您可以根据需要调整参数和逻辑

  const numAnts = 10;
  const numIterations = 100;
  const alpha = 1; // 信息素重要程度
  const beta = 2;  // 启发函数重要程度
  const evaporationRate = 0.5;
  const Q = 100;

  // 初始化信息素矩阵
  const pheromone = Array(points.length).fill(0).map(() => Array(points.length).fill(1));

  // 计算距离矩阵
  const distanceMatrix = [];
  for (let i = 0; i < points.length; i++) {
    const distances = [];
    for (let j = 0; j < points.length; j++) {
      if (i === j) {
        distances.push(Infinity);
      } else {
        const dx = points[i][0] - points[j][0];
        const dy = points[i][1] - points[j][1];
        distances.push(Math.sqrt(dx * dx + dy * dy));
      }
    }
    distanceMatrix.push(distances);
  }

  let bestRoute = null;
  let bestDistance = Infinity;

  for (let iter = 0; iter < numIterations; iter++) {
    const allRoutes = [];
    const allDistances = [];

    for (let ant = 0; ant < numAnts; ant++) {
      const route = [0]; // 从起点开始，起点索引为 0
      const visited = new Set();
      visited.add(0);

      while (route.length < points.length) {
        const current = route[route.length - 1];
        const probabilities = [];

        // 计算转移概率
        for (let i = 0; i < points.length; i++) {
          if (!visited.has(i)) {
            const tau = pheromone[current][i] ** alpha;
            const eta = (1 / distanceMatrix[current][i]) ** beta;
            probabilities.push({ index: i, value: tau * eta });
          }
        }

        // 归一化概率
        const sum = probabilities.reduce((acc, curr) => acc + curr.value, 0);
        probabilities.forEach((prob) => {
          prob.value /= sum;
        });

        // 轮盘赌选择下一个点
        const rand = Math.random();
        let cumulative = 0;
        let nextPoint = probabilities[0].index;
        for (const prob of probabilities) {
          cumulative += prob.value;
          if (rand <= cumulative) {
            nextPoint = prob.index;
            break;
          }
        }

        route.push(nextPoint);
        visited.add(nextPoint);
      }

      // 计算路线距离
      let distance = 0;
      for (let i = 0; i < route.length - 1; i++) {
        distance += distanceMatrix[route[i]][route[i + 1]];
      }

      allRoutes.push(route);
      allDistances.push(distance);

      // 更新最优解
      if (distance < bestDistance) {
        bestDistance = distance;
        bestRoute = route;
      }
    }

    // 信息素蒸发
    for (let i = 0; i < pheromone.length; i++) {
      for (let j = 0; j < pheromone[i].length; j++) {
        pheromone[i][j] *= (1 - evaporationRate);
      }
    }

    // 信息素更新
    for (let k = 0; k < allRoutes.length; k++) {
      const route = allRoutes[k];
      const distance = allDistances[k];
      for (let i = 0; i < route.length - 1; i++) {
        pheromone[route[i]][route[i + 1]] += Q / distance;
      }
    }
  }

  // 构建最优路径对应的点列表（去除起点）
  const optimizedRoute = bestRoute.slice(1).map(index => points[index]);

  return {
    route: optimizedRoute,
    distance: bestDistance,
  };
}

module.exports = { optimizeRoute };