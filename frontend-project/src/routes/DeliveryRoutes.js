import { storeAuthToken } from "@utils/tokenStorage";
// Frontend-project/src/routes/DeliveryRoutes.js

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Profile from '@components/DeliveryHome/Profile';
import CurrentOrders from '@components/DeliveryHome/CurrentOrders';
import EarningsHistory from '@components/DeliveryHome/EarningsHistory';
import Navigation from '@components/DeliveryHome/Navigation';
import Notifications from '@components/DeliveryHome/Notifications';
import Support from '@components/DeliveryHome/Support';
import NotAuthorized from '@components/common/NotAuthorized';
import useAuth from '@hooks/useAuth';
import ProtectedRoute from '@components/ProtectedRoute';
import { UserRole } from '@constants';

/**
 * DeliveryRoutes 组件用于定义配送员专属的路由。
 * 仅当用户角色为 DELIVERY_PERSON 时，才允许访问这些路由。
 */
const DeliveryRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* 仅允许配送员角色访问 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<Navigation />}
          />
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<Profile />}
          />
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<CurrentOrders />}
          />
        }
      />
      <Route
        path="/earnings"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<EarningsHistory />}
          />
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<Notifications />}
          />
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute
            roles={[UserRole.DELIVERY_PERSON]}
            element={<Support />}
          />
        }
      />
      {/* 未授权访问 */}
      <Route path="/not-authorized" element={<NotAuthorized />} />
      {/* 所有其他路由重定向到仪表盘 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DeliveryRoutes;
