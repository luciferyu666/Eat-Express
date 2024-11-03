import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/pages/RestaurantHomePage.js

import React, { useEffect, useState, useContext } from 'react';
import axios from '../axiosConfig'; // 使用配置好的 Axios 實例
import SalesReports from '@components/RestaurantHomePage/SalesReports';
import { UserContext } from '@context/UserContext';
import RestaurantInfo from '@components/RestaurantHomePage/RestaurantInfo';
import BusinessStatus from '@components/RestaurantHomePage/BusinessStatus';
import OrderManagement from '@components/RestaurantHomePage/OrderManagement';
import MenuManagement from '@components/RestaurantHomePage/MenuManagement';
import Notifications from '@components/RestaurantHomePage/Notifications';
import EmployeeManagement from '@components/RestaurantHomePage/EmployeeManagement';
import Support from '@components/RestaurantHomePage/Support';
import { getSocket } from '@utils/socket';

const RestaurantHomePage = () => {
  const { user } = useContext(UserContext);
  const [restaurantData, setRestaurantData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [businessStatus, setBusinessStatus] = useState('Open');
  const [salesData, setSalesData] = useState(null); // 初始化為 null
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // 通用的數據獲取函數
  const fetchData = async (url, setter) => {
    try {
      const response = await axios.get(url); // 使用相對路徑
      setter(response.data);
    } catch (error) {
      console.error(`获取 ${url} 失败:`, error);
    }
  };

  // 獲取餐廳基本資料
  useEffect(() => {
    setLoading(true);
    fetchData('/reports/operations', setRestaurantData).finally(() =>
      setLoading(false)
    );
  }, [user.token]);

  // 獲取其他相關數據
  useEffect(() => {
    if (restaurantData) {
      fetchData('/reports/restaurants/sales', setSalesData);
      fetchData('/restaurants/employees', setEmployees);
      fetchData('/restaurants/notifications', setNotifications);
    }
  }, [restaurantData, user.token]);

  // 使用 Socket.IO 獲取訂單狀態更新
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('Socket 已連接:', socket.id);
      socket.on('newOrder', (order) =>
        setOrders((prevOrders) => [order, ...prevOrders])
      );
      socket.on('orderStatusUpdate', (updatedOrder) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === updatedOrder.id
              ? { ...order, status: updatedOrder.status }
              : order
          )
        );
      });
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.once('connect', handleConnect);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('newOrder');
      socket.off('orderStatusUpdate');
    };
  }, [user.token]);

  // 更新餐廳資料的函數
  const updateRestaurantData = async (updatedData) => {
    try {
      const response = await axios.put('/restaurants/profile', updatedData);
      setRestaurantData(response.data);
    } catch (error) {
      console.error('更新餐廳資料失敗:', error);
    }
  };

  if (loading) {
    return <p>載入中...</p>;
  }

  if (!restaurantData) {
    return <p>無法獲取餐廳資料。</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* 渲染 BusinessStatus 組件 */}
      <BusinessStatus status={businessStatus} setStatus={setBusinessStatus} />
      <RestaurantInfo
        restaurantData={restaurantData}
        updateRestaurantData={updateRestaurantData}
      />
      {/* 其餘組件保持不變，例如 OrderManagement, MenuManagement 等 */}
      <OrderManagement orders={orders} />
      <MenuManagement />
      <SalesReports data={salesData} />{' '}
      {/* 確保傳遞的是包含 dailySales 和 topDishes 的對象 */}
      <Notifications notifications={notifications} />
      <EmployeeManagement employees={employees} />
      <Support />
    </div>
  );
};

export default RestaurantHomePage;
