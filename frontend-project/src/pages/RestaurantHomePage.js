// src/pages/RestaurantHomePage.js

import React, { useEffect, useState } from 'react';
import RestaurantInfo from '../components/RestaurantHomePage/RestaurantInfo';
import BusinessStatus from '../components/RestaurantHomePage/BusinessStatus';
import OrderManagement from '../components/RestaurantHomePage/OrderManagement';
import MenuManagement from '../components/RestaurantHomePage/MenuManagement';
import SalesReports from '../components/RestaurantHomePage/SalesReports';
import Notifications from '../components/RestaurantHomePage/Notifications';
import EmployeeManagement from '../components/RestaurantHomePage/EmployeeManagement';
import Support from '../components/RestaurantHomePage/Support';
import { getSocket } from '../socket';
import api from '../utils/api';

const RestaurantHomePage = () => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [businessStatus, setBusinessStatus] = useState('Open');
  const [salesData, setSalesData] = useState([]); // 初始化為空數組
  const [notifications, setNotifications] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async (url, setter) => {
    try {
      const response = await api.get(url);
      setter(response.data);
    } catch (error) {
      console.error(`获取 ${url} 失败:`, error);
    }
  };

  // 获取餐厅基本资料
  useEffect(() => {
    setLoading(true);
    fetchData('/restaurants/profile', setRestaurantData).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (restaurantData) {
      fetchData('/restaurants/sales', setSalesData);
      fetchData('/restaurants/employees', setEmployees);
      fetchData('/restaurants/notifications', setNotifications);
    }
  }, [restaurantData]);

  // 使用 Socket 获取订单状态更新
  useEffect(() => {
    const socket = getSocket();

    const handleConnect = () => {
      console.log('Socket 已连接:', socket.id);
      socket.on('newOrder', (order) => setOrders((prevOrders) => [order, ...prevOrders]));
      socket.on('orderStatusUpdate', (updatedOrder) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
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
  }, []);

  const updateRestaurantData = async (updatedData) => {
    try {
      const response = await api.put('/restaurants/profile', updatedData);
      setRestaurantData(response.data);
    } catch (error) {
      console.error('更新餐厅资料失败:', error);
    }
  };

  if (loading) {
    return <p>载入中...</p>;
  }

  if (!restaurantData) {
    return <p>无法获取餐厅资料。</p>;
  }

  return (
    <div className="container mx-auto p-4">
      {/* 渲染 BusinessStatus 组件 */}
      <BusinessStatus status={businessStatus} setStatus={setBusinessStatus} />
      <RestaurantInfo restaurantData={restaurantData} updateRestaurantData={updateRestaurantData} />
      {/* 其余组件保持不变，例如 OrderManagement, MenuManagement 等 */}
      <OrderManagement orders={orders} />
      <MenuManagement />
      <SalesReports data={salesData} /> {/* 确保传递的是数组 */}
      <Notifications notifications={notifications} />
      <EmployeeManagement employees={employees} />
      <Support />
    </div>
  );
};

export default RestaurantHomePage;
