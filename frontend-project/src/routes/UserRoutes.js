import { storeAuthToken } from "@utils/tokenStorage";
// Frontend-project/src/routes/UserRoutes.js

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@components/ProtectedRoute';
import { UserRole } from '@constants';

/**
 * 懒加载用户专属组件
 */
const MenuBrowser = lazy(() =>
  import('../components/UserHomePage/MenuBrowser')
);
const NearbyRestaurants = lazy(() =>
  import('../components/UserHomePage/NearbyRestaurants')
);
const OrderTracking = lazy(() =>
  import('../components/UserHomePage/OrderTracking')
);
const PaymentPage = lazy(() =>
  import('../components/UserHomePage/PaymentPage')
);
const PersonalizedRecommendations = lazy(() =>
  import('../components/UserHomePage/PersonalizedRecommendations')
);
const PopularDishes = lazy(() =>
  import('../components/UserHomePage/PopularDishes')
);
const SearchBar = lazy(() => import('../components/UserHomePage/SearchBar'));
const ShoppingCart = lazy(() =>
  import('../components/UserHomePage/ShoppingCart')
);
const NotAuthorized = lazy(() => import('../components/common/NotAuthorized'));

/**
 * UserRoutes 组件用于定义用户专属的路由。
 * 仅当用户角色为 CUSTOMER 时，才允许访问这些路由。
 *
 * @returns {React.ReactElement} 渲染的路由组件
 */
const UserRoutes = () => {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <Routes>
        {/* 仅允许用户角色访问的路由 */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<MenuBrowser />}
            />
          }
        />
        <Route
          path="/nearby-restaurants"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<NearbyRestaurants />}
            />
          }
        />
        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<OrderTracking />}
            />
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<PaymentPage />}
            />
          }
        />
        <Route
          path="/personalized-recommendations"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<PersonalizedRecommendations />}
            />
          }
        />
        <Route
          path="/popular-dishes"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<PopularDishes />}
            />
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<SearchBar />}
            />
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute
              roles={[UserRole.CUSTOMER]}
              element={<ShoppingCart />}
            />
          }
        />
        {/* 未授权访问页面 */}
        <Route path="/not-authorized" element={<NotAuthorized />} />
        {/* 所有其他路由重定向到菜单页面 */}
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UserRoutes;
