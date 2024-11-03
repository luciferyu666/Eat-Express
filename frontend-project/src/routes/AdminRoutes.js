import { storeAuthToken } from "@utils/tokenStorage";
// Frontend-project/src/routes/AdminRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DataReports from '@components/AdminHomePage/DataReports';
import DeliveryLocationMonitor from '@components/AdminHomePage/DeliveryLocationMonitor';
import OperationalStatusMonitor from '@components/AdminHomePage/OperationalStatusMonitor';
import OrderStatusMonitor from '@components/AdminHomePage/OrderStatusMonitor';
import RestaurantManagement from '@components/AdminHomePage/RestaurantManagement';
import SystemMonitoring from '@components/AdminHomePage/SystemMonitoring';
import UserManagement from '@components/AdminHomePage/UserManagement';
import NotAuthorized from '@components/common/NotAuthorized';
import ProtectedRoute from '@components/ProtectedRoute';
import useAuth from '@hooks/useAuth';
import { UserRole } from '@constants';

/**
 * AdminRoutes 组件用于定义管理员专属的路由。
 * 仅当用户角色为 ADMIN 时，才允许访问这些路由。
 *
 * @returns {React.ReactElement} 渲染的路由组件
 */
const AdminRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 仅允许管理员角色访问的路由 */}
      <Route
        path="/data-reports"
        element={
          <ProtectedRoute roles={[UserRole.ADMIN]} element={<DataReports />} />
        }
      />
      <Route
        path="/delivery-location-monitor"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<DeliveryLocationMonitor />}
          />
        }
      />
      <Route
        path="/operational-status-monitor"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<OperationalStatusMonitor />}
          />
        }
      />
      <Route
        path="/order-status-monitor"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<OrderStatusMonitor />}
          />
        }
      />
      <Route
        path="/restaurant-management"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<RestaurantManagement />}
          />
        }
      />
      <Route
        path="/system-monitoring"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<SystemMonitoring />}
          />
        }
      />
      <Route
        path="/user-management"
        element={
          <ProtectedRoute
            roles={[UserRole.ADMIN]}
            element={<UserManagement />}
          />
        }
      />
      {/* 未授权访问页面 */}
      <Route path="/not-authorized" element={<NotAuthorized />} />
      {/* 所有其他路由重定向到系统监控页面 */}
      <Route path="*" element={<Navigate to="/system-monitoring" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
