import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/apiPaths.js

/**
 * @typedef {Object} DeliveryPersonPaths
 * @property {string} CURRENT_ORDERS - 当前订单路径
 * @property {string} EARNINGS - 收益路径
 * @property {string} ORDER_HISTORY - 订单历史路径
 * @property {string} PROFILE - 个人资料路径
 * @property {string} LOCATION - 位置路径
 * @property {string} STATUS - 状态路径
 * @property {(orderId: string) => string} ORDER_DETAILS - 订单详情路径生成函数
 */

/**
 * @typedef {Object} ApiPaths
 * @property {DeliveryPersonPaths} DELIVERY_PERSON - 配送员相关路径
 * // 未来可添加其他角色的路径
 * // CUSTOMER: CustomerPaths;
 * // ADMIN: AdminPaths;
 */

/**
 * 定义常量 API_PATHS
 * @type {Readonly<ApiPaths>}
 */
const API_PATHS = Object.freeze({
  DELIVERY_PERSON: Object.freeze({
    CURRENT_ORDERS: '/delivery-person/orders/current',
    EARNINGS: '/delivery-person/earnings',
    ORDER_HISTORY: '/delivery-person/orders/history',
    PROFILE: '/delivery-person/profile',
    LOCATION: '/delivery-person/location',
    STATUS: '/delivery-person/status',
    /**
     * 生成订单详情路径
     * @param {string} orderId - 订单 ID
     * @returns {string} 订单详情路径
     */
    ORDER_DETAILS: (orderId) => `/delivery-person/orders/${orderId}`,
  }),
  // CUSTOMER: Object.freeze({ ... }),
  // ADMIN: Object.freeze({ ... }),
});

/**
 * 获取指定角色的 API 路径
 * @param {string} role - 用户角色
 * @returns {DeliveryPersonPaths | undefined} 对应角色的 API 路径对象
 */
const getApiPathsByRole = (role) => {
  return API_PATHS[role];
};

/**
 * 获取订单详情路径
 * @param {string} orderId - 订单 ID
 * @returns {string} 订单详情路径
 */
const getOrderDetailsPath = (orderId) => {
  if (typeof orderId !== 'string' || orderId.trim() === '') {
    console.warn(`Invalid orderId: ${orderId}. Expected a non-empty string.`);
    return '';
  }
  return API_PATHS.DELIVERY_PERSON.ORDER_DETAILS(orderId);
};

module.exports = {
  API_PATHS,
  getApiPathsByRole,
  getOrderDetailsPath,
};
