// src/App.js

import React, { useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import { UserContext } from '@context/UserContext';
import AppProviders from '@context/AppProviders';
import useSocket from '@hooks/useSocket';

import HomePage from '@pages/HomePage';
import NotFound from '@pages/NotFound';
import ErrorBoundary from '@components/ErrorBoundary';
import NavigationBar from '@components/NavigationBar';
import AdminNavigation from '@components/AdminNavigation';
import ProtectedRoute from '@components/ProtectedRoute';

import UserLogin from '@components/UserLogin';
import UserRegister from '@components/UserRegister';
import RestaurantLogin from '@components/RestaurantLogin';
import RestaurantRegister from '@components/RestaurantRegister';
import DeliveryLogin from '@components/DeliveryLogin';
import DeliveryRegister from '@components/DeliveryRegister';
import AdminLogin from '@components/AdminLogin';
import AdminRegister from '@components/AdminRegister';

import UserRole from '@constants/roles';

// 導入角色專屬的路由組件
import UserRoutes from '@routes/UserRoutes';
import RestaurantRoutes from '@routes/RestaurantRoutes';
import DeliveryRoutes from '@routes/DeliveryRoutes';
import AdminRoutes from '@routes/AdminRoutes';

/**
 * 應用的主要內容組件，負責渲染導航欄、頭部信息和主要路由內容。
 * 使用了用戶上下文和自定義的 Socket Hook。
 *
 * @returns {JSX.Element} 應用內容的 JSX 元素
 */
function AppContent() {
  const { user } = useContext(UserContext); // 從 UserContext 獲取 user

  useSocket(); // 使用自定義的 useSocket Hook 管理 Socket.IO 連接

  return (
    <div className="flex flex-col min-h-screen">
      <NavigationBar />
      {user && user.role === UserRole.ADMIN && <AdminNavigation />}
      <header className="bg-gray-800 p-4">
        <h1 className="text-white text-2xl">Food Delivery 平台</h1>
        <p className="text-white">歡迎使用，我們將根據您的角色提供最佳服務！</p>
      </header>
      <main className="flex-grow">
        <ErrorBoundary>
          <Routes>
            {/* 公共路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/user/login" element={<UserLogin />} />
            <Route path="/user/register" element={<UserRegister />} />
            <Route path="/restaurant/login" element={<RestaurantLogin />} />
            <Route
              path="/restaurant/register"
              element={<RestaurantRegister />}
            />
            <Route path="/delivery/login" element={<DeliveryLogin />} />
            <Route path="/delivery/register" element={<DeliveryRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} />

            {/* 用戶專屬路由 */}
            <Route
              path="/user/*"
              element={
                <ProtectedRoute role={UserRole.CUSTOMER}>
                  <UserRoutes />
                </ProtectedRoute>
              }
            />

            {/* 餐廳專屬路由 */}
            <Route
              path="/restaurant/*"
              element={
                <ProtectedRoute role={UserRole.RESTAURANT_OWNER}>
                  <RestaurantRoutes />
                </ProtectedRoute>
              }
            />

            {/* 外送員專屬路由 */}
            <Route
              path="/delivery/*"
              element={
                <ProtectedRoute role={UserRole.DELIVERY_PERSON}>
                  <DeliveryRoutes />
                </ProtectedRoute>
              }
            />

            {/* 管理員專屬路由 */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role={UserRole.ADMIN}>
                  <AdminRoutes />
                </ProtectedRoute>
              }
            />

            {/* 404 頁面 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
}

/**
 * 應用的根組件，使用全局的上下文提供者包裹主要內容。
 *
 * @returns {JSX.Element} 應用的根組件
 */
function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
