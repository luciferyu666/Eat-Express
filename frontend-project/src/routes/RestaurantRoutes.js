import { storeAuthToken } from "@utils/tokenStorage";
// Frontend-project/src/routes/RestaurantRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RestaurantInfo from '@components/RestaurantHomePage/RestaurantInfo';
import MenuManagement from '@components/RestaurantHomePage/MenuManagement';
import OrderManagement from '@components/RestaurantHomePage/OrderManagement';
import EmployeeManagement from '@components/RestaurantHomePage/EmployeeManagement';
import BusinessStatus from '@components/RestaurantHomePage/BusinessStatus';
import SalesReports from '@components/RestaurantHomePage/SalesReports';
import Notifications from '@components/RestaurantHomePage/Notifications';
import Support from '@components/RestaurantHomePage/Support';
import NotAuthorized from '@components/common/NotAuthorized';
import ProtectedRoute from '@components/ProtectedRoute';
import useAuth from '@hooks/useAuth';
import { UserRole } from '@constants';

/**
 * RestaurantRoutes 组件用于定义餐厅专属的路由。
 * 仅当用户角色为 RESTAURANT_OWNER 时，才允许访问这些路由。
 */
const RestaurantRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 仅允许餐厅角色访问的路由 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<RestaurantInfo />}
          />
        }
      />
      <Route
        path="/menu"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<MenuManagement />}
          />
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<OrderManagement />}
          />
        }
      />
      <Route
        path="/employee-management"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<EmployeeManagement />}
          />
        }
      />
      <Route
        path="/business-status"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<BusinessStatus />}
          />
        }
      />
      <Route
        path="/sales-reports"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<SalesReports />}
          />
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<Notifications />}
          />
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute
            roles={[UserRole.RESTAURANT_OWNER]}
            element={<Support />}
          />
        }
      />
      {/* 未授权访问页面 */}
      <Route path="/not-authorized" element={<NotAuthorized />} />
      {/* 所有其他路由重定向到餐厅仪表盘 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default RestaurantRoutes;
