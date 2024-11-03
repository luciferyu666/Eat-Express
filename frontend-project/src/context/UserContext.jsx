import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/context/UserContext.js

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { connectSocket, disconnectSocket, getSocket } from '@utils/socket';
// import logger from "../utils/logger";

/**
 * 创建用户上下文，初始值为 undefined
 */
export const UserContext = createContext(undefined);

/**
 * 用户角色对应的登录路径映射
 */
const LOGIN_PATHS = {
  admin: '/admin/login',
  delivery_person: '/delivery/login',
  customer: '/login',
  'restaurant-owner': '/restaurants/login',
};

/**
 * UserProvider 组件
 *
 * @description
 * 负责管理用户的认证状态，包括从 sessionStorage 中获取和验证 JWT 令牌，
 * 与 WebSocket 的连接管理，以及用户的登录与登出功能。
 */
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  /**
   * 初始化用户认证状态
   *
   * @description
   * 从 sessionStorage 中获取 JWT 令牌，并验证其有效性。
   * 如果令牌有效，更新用户状态并连接 WebSocket。
   * 否则，清除用户状态并导航到登录页面。
   */
  useEffect(() => {
    const initializeUser = () => {
      const token = sessionStorage.getItem('authToken');
      logger.info('UserProvider: Retrieved token from sessionStorage:', token);
      if (token) {
        try {
          // 解码 JWT 令牌
          const decodedToken = jwtDecode(token);
          logger.info('UserProvider: Decoded Token:', decodedToken);

          // 确保令牌包含 userId 和 role
          if (decodedToken.userId && decodedToken.role) {
            setUser({
              userId: decodedToken.userId,
              role: decodedToken.role,
              token: token,
            });
            logger.info('UserProvider: User set to:', {
              userId: decodedToken.userId,
              role: decodedToken.role,
            });
            // 连接 WebSocket
            connectSocket(token);
          } else {
            logger.error('UserProvider: Token 缺少 userId 或 role');
            setUser(null);
            sessionStorage.removeItem('authToken');
            const loginPath = LOGIN_PATHS['restaurant-owner'] || '/login';
            navigate(loginPath);
          }
        } catch (error) {
          logger.error('UserProvider: Invalid token', error);
          setUser(null);
          sessionStorage.removeItem('authToken');
          const loginPath = LOGIN_PATHS['restaurant-owner'] || '/login';
          navigate(loginPath);
        }
      }
      setLoading(false);
    };
    initializeUser();
  }, [navigate]);

  /**
   * 监听 WebSocket 连接错误事件
   *
   * @description
   * 监听 WebSocket 的 'connect_error' 事件，特别处理 JWT 过期的情况，
   * 清除用户状态并导航到登录页面。
   */
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      /**
       * 处理连接错误
       *
       * @param {any} err - 错误对象
       */
      const handleConnectError = (err) => {
        if (err.message && err.message.includes('jwt expired')) {
          logger.error('Token 已过期，请重新登录。', err);
          setUser(null);
          sessionStorage.removeItem('authToken');
          disconnectSocket();
          const loginPath =
            user && user.role ? LOGIN_PATHS[user.role] : '/login';
          navigate(loginPath);
        }
      };

      /**
       * 处理断开连接
       *
       * @param {string} reason - 断开原因
       */
      const handleDisconnect = (reason) => {
        logger.warn('Socket disconnected:', reason);
        // 根据需要处理断开连接的逻辑
      };

      // 监听事件
      socket.on('connect_error', handleConnectError);
      socket.on('disconnect', handleDisconnect);

      // 清理事件监听
      return () => {
        socket.off('connect_error', handleConnectError);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [navigate, user]);

  /**
   * 登出函数
   *
   * @description
   * 清除用户状态和 Token，并导航到登录页面
   */
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('role');
    disconnectSocket();
    const loginPath = user && user.role ? LOGIN_PATHS[user.role] : '/login';
    navigate(loginPath);
    logger.info('UserProvider: 用户已登出');
  };

  /**
   * 使用 useMemo 缓存上下文值，避免不必要的重新渲染
   */
  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      logout,
    }),
    [user]
  );

  // 如果正在加载用户信息，显示加载状态
  if (loading) {
    return <div>载入中...</div>;
  }
  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};
