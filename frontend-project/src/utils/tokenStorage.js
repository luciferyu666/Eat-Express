// frontend-project/src/utils/tokenStorage.js

/**
 * Token Storage Utility
 *
 * 该模块负责管理认证令牌（authToken）、刷新令牌（refreshToken）和用户角色（role）的存储与获取。
 * 根据 `rememberMe` 的值，决定使用 `localStorage` 还是 `sessionStorage` 进行存储。
 */

/**
 * 存储认证令牌、刷新令牌和用户角色
 * @param {string} authToken - JWT 认证令牌
 * @param {string} refreshToken - 刷新令牌
 * @param {string} role - 用户角色
 * @param {boolean} rememberMe - 是否记住登录状态
 */
export const storeAuthTokens = (authToken, refreshToken, role, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
  
    storage.setItem('authToken', authToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('role', role);
  };
  
  /**
   * 移除认证令牌、刷新令牌和用户角色
   *
   * 此函数会从 `localStorage` 和 `sessionStorage` 中移除所有相关项，
   * 以确保无论之前使用了哪种存储方式，所有敏感信息都被清除。
   */
  export const removeAuthTokens = () => {
    // 移除 localStorage 中的项目
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
  
    // 移除 sessionStorage 中的项目
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
  };
  
  /**
   * 获取存储的认证令牌、刷新令牌和用户角色
   *
   * 优先从 `sessionStorage` 中获取，如果不存在，再从 `localStorage` 中获取。
   *
   * @returns {Object|null} - 包含 `authToken`、`refreshToken` 和 `role` 的对象，或 `null` 如果未找到。
   */
  export const getAuthTokens = () => {
    // 优先从 sessionStorage 获取
    const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    const refreshToken = sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
    const role = sessionStorage.getItem('role') || localStorage.getItem('role');
  
    if (authToken && refreshToken && role) {
      return { authToken, refreshToken, role };
    }
  
    return null;
  };
  
  /**
   * 获取认证令牌
   *
   * @returns {string|null} - 返回存储的 `authToken`，如果不存在则返回 `null`。
   */
  export const getAuthToken = () => {
    return sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  };
  
  /**
   * 获取刷新令牌
   *
   * @returns {string|null} - 返回存储的 `refreshToken`，如果不存在则返回 `null`。
   */
  export const getRefreshToken = () => {
    return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
  };
  
  /**
   * 获取用户角色
   *
   * @returns {string|null} - 返回存储的 `role`，如果不存在则返回 `null`。
   */
  export const getRole = () => {
    return sessionStorage.getItem('role') || localStorage.getItem('role');
  };