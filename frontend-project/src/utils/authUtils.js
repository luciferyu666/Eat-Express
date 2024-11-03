import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/utils/authUtils.js

import { ROLES } from '@utils/constants';

/**
 * 用户角色对应的登录路径映射
 */
const LOGIN_PATHS = {
  [ROLES.ADMIN]: '/admin/login',
  [ROLES.DELIVERY_PERSON]: '/delivery/login',
  [ROLES.CUSTOMER]: '/login',
};

/**
 * 获取登录页面的重定向路径
 * @param {string} [role=ROLES.CUSTOMER] - 用户角色
 * @returns {string} 登录页面路径
 */
const getLoginPath = (role = ROLES.CUSTOMER) => {
  if (typeof role !== 'string') {
    console.warn(`无效的角色类型：预期为字符串，但收到 ${typeof role}`);
    return LOGIN_PATHS[ROLES.CUSTOMER];
  }

  if (!Object.values(ROLES).includes(role)) {
    console.warn(`无效的角色值：${role}`);
    return LOGIN_PATHS[ROLES.CUSTOMER];
  }

  return LOGIN_PATHS[role] || LOGIN_PATHS[ROLES.CUSTOMER];
};

export default {
  getLoginPath,
};
