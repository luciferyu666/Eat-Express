import { storeAuthToken } from "@utils/tokenStorage";
// src/context/AppProviders.jsx

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import store from '../store';
import { AuthProvider } from '@context/AuthContext';
import { UserProvider } from '@context/UserContext';
import { DeliveryProvider } from '@context/DeliveryContext';
import ErrorBoundary from '@components/ErrorBoundary';

/**
 * AppProviders 组件用于集中提供应用所需的全局状态和上下文。
 * - ReduxProvider：提供 Redux store，供整个应用使用。
 * - AuthProvider：提供认证相关的上下文。
 * - UserProvider：提供用户相关的上下文，可能依赖于 AuthContext。
 * - DeliveryProvider：提供配送相关的上下文，可能依赖于 UserContext。
 * - ErrorBoundary：捕获组件树中的 JavaScript 错误，防止应用崩溃。
 *
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 * @returns {JSX.Element} Provider 组件
 */
const AppProviders = ({ children }) => (
  <ReduxProvider store={store}>
    <AuthProvider>
      <UserProvider>
        <DeliveryProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </DeliveryProvider>
      </UserProvider>
    </AuthProvider>
  </ReduxProvider>
);

export default AppProviders;
