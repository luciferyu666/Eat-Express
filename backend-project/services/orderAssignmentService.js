// backend-project/services/orderAssignmentService.js

const User = require('../models/User'); // 假设外送员是 User 模型中具有特定角色的用户
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { getDistanceAndDuration } = require('../utils/distanceCalculator');
const { optimizeRoute } = require('./routeOptimizationService');
// const logger = require('../utils/logger');
const geocodeAddress = require('../utils/geocodeAddress'); // 用于地理编码地址

/**
 * 自动化订单分配函数
 * @param {Object} order - 新订单对象
 * @param {Object} session - Mongoose session 对象
 * @returns {Object|null} - 分配的外送员对象或 null
 */
async function assignOrderToDeliveryPerson(order, session) {
  try {
    // 获取餐厅详细信息
    const restaurant = await Restaurant.findById(order.restaurant).session(session);
    if (!restaurant) {
      console.warn(`餐厅未找到，餐厅 ID: ${order.restaurant}`);
      return null;
    }

    const restaurantAddress = restaurant.address; // 假设 Restaurant 模型有 address 字段
    const restaurantCoordinates = await geocodeAddress(restaurantAddress);
    if (!restaurantCoordinates) {
      console.warn(`无法获取餐厅地址的坐标，地址: ${restaurantAddress}`);
      return null;
    }

    // 1. 筛选在线且可接单的外送员
    let availableDeliveryPersons = await User.find({
      role: 'delivery_person',
      availability: true,
      currentOrderCount: { $lt: 3 },
    }).session(session);

    if (availableDeliveryPersons.length === 0) {
      console.info('没有可用的外送员。');
      return null;
    }

    // 2. 计算距离
    const origins = [restaurantCoordinates]; // 经纬度坐标数组
    const destinations = availableDeliveryPersons.map(person => person.currentLocation.coordinates);

    const distanceResults = await getDistanceAndDuration(origins, destinations);
    if (!distanceResults || distanceResults.length !== destinations.length) {
      console.warn('距离计算失败或结果数量不匹配');
      return null;
    }

    // 3. 组合外送员与距离
    const deliveryPersonsWithDistance = availableDeliveryPersons.map((person, index) => ({
      person,
      distance: distanceResults[index]?.distance || Infinity,
      duration: distanceResults[index]?.duration || Infinity,
    }));

    // 4. 筛选在配送半径内的外送员
    const filteredDeliveryPersons = deliveryPersonsWithDistance.filter(dp => dp.distance <= dp.person.deliveryRadius);

    if (filteredDeliveryPersons.length === 0) {
      console.info('没有在配送半径内的外送员。');
      return null;
    }

    // 5. 按距离排序
    filteredDeliveryPersons.sort((a, b) => a.distance - b.distance);

    // 6. 选择负荷最轻的外送员
    let selectedDeliveryPerson = filteredDeliveryPersons[0].person;
    let minLoad = selectedDeliveryPerson.currentOrderCount;

    for (let dp of filteredDeliveryPersons) {
      if (dp.person.currentOrderCount < minLoad) {
        selectedDeliveryPerson = dp.person;
        minLoad = dp.person.currentOrderCount;
      }
    }

    // 7. 分配订单
    order.deliveryPerson = selectedDeliveryPerson._id;
    order.status = 'assigned';
    await order.save({ session });

    // 8. 更新外送员的当前订单和可用性
    selectedDeliveryPerson.currentOrders.push(order._id);
    selectedDeliveryPerson.currentOrderCount += 1;

    if (selectedDeliveryPerson.currentOrderCount >= 3) {
      selectedDeliveryPerson.availability = false;
    }

    await selectedDeliveryPerson.save({ session });

    console.info(`订单 ${order._id} 已分配给外送员 ${selectedDeliveryPerson._id}`);

    // 9. 路径优化
    const currentOrders = await Order.find({
      deliveryPerson: selectedDeliveryPerson._id,
      status: { $in: ['assigned', 'in_transit'] },
    }).session(session);

    const optimizedRoute = await optimizeRoute(selectedDeliveryPerson, currentOrders);
    if (optimizedRoute) {
      selectedDeliveryPerson.optimizedRoute = optimizedRoute.route;
      selectedDeliveryPerson.totalDistance = optimizedRoute.distance;
      await selectedDeliveryPerson.save({ session });
      console.info(`外送员 ${selectedDeliveryPerson._id} 的优化路径:`, optimizedRoute.route);
    } else {
      console.warn(`路径优化失败，外送员 ID: ${selectedDeliveryPerson._id}`);
    }

    return selectedDeliveryPerson;
  } catch (error) {
    console.error('assignOrderToDeliveryPerson 中的错误:', error);
    throw error; // 控制器将捕获并回滚事务
  }
}

module.exports = { assignOrderToDeliveryPerson };