import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/context/AuthContext.jsx

import React, { createContext, useContext, useState } from 'react';

/**
 * 定义上下文类型
 * @typedef {Object} AuthContextType
 * @property {string|null} error - 错误信息
 * @property {(error: string|null) => void} setError - 设置错误信息的函数
 */

/**
 * 创建 AuthContext
 * @type {React.Context<AuthContextType|undefined>}
 */
export const AuthContext = createContext(undefined);

/**
 * 提供 AuthContext 的组件
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} Provider 组件
 */
export const AuthProvider = ({ children }) => {
  const [error, setError] = useState(null);

  return (
    <AuthContext.Provider value={{ error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * 使用 AuthContext 的自定义 Hook
 * @returns {AuthContextType} AuthContext 的值
 * @throws {Error} 如果在非 AuthProvider 环境中使用
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
};
