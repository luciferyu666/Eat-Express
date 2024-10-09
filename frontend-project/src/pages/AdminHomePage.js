// src/pages/AdminHomePage.js

import React, { useState } from 'react';
import OrderStatusMonitor from '../components/OrderStatusMonitor';
import OperationalStatusMonitor from '../components/OperationalStatusMonitor';
import DeliveryPersonLocationMonitor from '../components/DeliveryPersonLocationMonitor';
import UserManagement from '../components/UserManagement';
import RestaurantManagement from '../components/RestaurantManagement';
import DeliveryPersonManagement from '../components/DeliveryPersonManagement';
import SystemOperationReports from '../components/SystemOperationReports';
import UserBehaviorAnalysis from '../components/UserBehaviorAnalysis';
import RestaurantPerformanceAnalysis from '../components/RestaurantPerformanceAnalysis';
import LogoutButton from '../components/LogoutButton'; // 引入登出按鈕

const AdminHomePage = () => {
  // 篩選狀態
  const [filter, setFilter] = useState({ restaurant: '', user: '', delivery: '' });

  // 處理篩選條件變更
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  // 增加更多的模擬數據
  const mockOrderData = [
    { id: '1', user: 'John Doe', status: 'active', details: '2 x Burger', restaurant: 'Test Restaurant A', deliveryPerson: 'Alex' },
    { id: '2', user: 'Jane Doe', status: 'completed', details: '1 x Salad', restaurant: 'Test Restaurant B', deliveryPerson: 'Sam' },
    { id: '3', user: 'Mike Smith', status: 'delayed', details: '3 x Pizza', restaurant: 'Sample Eatery', deliveryPerson: 'Taylor' },
    { id: '4', user: 'Sarah Johnson', status: 'cancelled', details: '1 x Pasta', restaurant: 'Gourmet Place', deliveryPerson: 'Chris' },
    { id: '5', user: 'David Lee', status: 'preparing', details: '2 x Steak', restaurant: 'Quick Bites', deliveryPerson: 'Jordan' },
    { id: '6', user: 'Emily Brown', status: 'completed', details: '4 x Sushi Rolls', restaurant: 'Test Restaurant A', deliveryPerson: 'Alex' },
    { id: '7', user: 'Chris Williams', status: 'active', details: '1 x Cheeseburger, 1 x Fries', restaurant: 'Sample Eatery', deliveryPerson: 'Taylor' },
    { id: '8', user: 'Patricia Miller', status: 'completed', details: '2 x Tacos', restaurant: 'Test Restaurant B', deliveryPerson: 'Sam' },
    { id: '9', user: 'Nancy Davis', status: 'preparing', details: '3 x Pancakes', restaurant: 'Gourmet Place', deliveryPerson: 'Chris' },
    { id: '10', user: 'George Wilson', status: 'active', details: '1 x Sandwich', restaurant: 'Quick Bites', deliveryPerson: 'Jordan' },
    { id: '11', user: 'Betty Garcia', status: 'delayed', details: '5 x Dumplings', restaurant: 'Sample Eatery', deliveryPerson: 'Taylor' },
    { id: '12', user: 'James Anderson', status: 'cancelled', details: '1 x Pizza, 1 x Soda', restaurant: 'Test Restaurant A', deliveryPerson: 'Alex' },
    { id: '13', user: 'Jessica Moore', status: 'active', details: '2 x Salad Bowls', restaurant: 'Test Restaurant B', deliveryPerson: 'Sam' },
    { id: '14', user: 'Larry White', status: 'completed', details: '1 x Chicken Wings', restaurant: 'Gourmet Place', deliveryPerson: 'Chris' },
    { id: '15', user: 'Mary Jones', status: 'preparing', details: '2 x Ramen', restaurant: 'Quick Bites', deliveryPerson: 'Jordan' },
  ];

  const mockOperationalStatus = {
    activeRestaurants: 15,
    totalOrders: 200,
    issuesReported: 8,
    averageDeliveryTime: '28 mins',
    activeUsers: 450,
  };

  const mockDeliveryPersonLocations = [
    { id: '1', name: 'Alex', location: 'Street A', status: 'delivering', ordersDelivered: 20 },
    { id: '2', name: 'Sam', location: 'Street B', status: 'waiting', ordersDelivered: 15 },
    { id: '3', name: 'Taylor', location: 'Street C', status: 'delivering', ordersDelivered: 30 },
    { id: '4', name: 'Chris', location: 'Street D', status: 'offline', ordersDelivered: 10 },
    { id: '5', name: 'Jordan', location: 'Street E', status: 'delivering', ordersDelivered: 8 },
  ];

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', totalOrders: 5 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', totalOrders: 3 },
    { id: '3', name: 'Michael Johnson', email: 'michael@example.com', status: 'active', totalOrders: 7 },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'banned', totalOrders: 1 },
    { id: '5', name: 'William Brown', email: 'william@example.com', status: 'active', totalOrders: 10 },
  ];

  const mockRestaurants = [
    { id: '1', name: 'Test Restaurant A', address: '123 Test St.', status: 'active', averageRating: 4.5 },
    { id: '2', name: 'Test Restaurant B', address: '456 Sample Ave.', status: 'inactive', averageRating: 4.0 },
    { id: '3', name: 'Sample Eatery', address: '789 Main St.', status: 'active', averageRating: 4.8 },
    { id: '4', name: 'Gourmet Place', address: '1010 Flavor Rd.', status: 'active', averageRating: 4.2 },
    { id: '5', name: 'Quick Bites', address: '111 Snack Ave.', status: 'closed', averageRating: 3.9 },
  ];

  const mockDeliveryPersons = [
    { id: '1', name: 'Alex', totalDeliveries: 15, status: 'active', averageRating: 4.7 },
    { id: '2', name: 'Sam', totalDeliveries: 20, status: 'inactive', averageRating: 4.5 },
    { id: '3', name: 'Taylor', totalDeliveries: 30, status: 'active', averageRating: 4.9 },
    { id: '4', name: 'Chris', totalDeliveries: 10, status: 'inactive', averageRating: 4.3 },
    { id: '5', name: 'Jordan', totalDeliveries: 8, status: 'active', averageRating: 4.0 },
  ];

  // 模擬系統報告數據
  const mockSystemReports = [
    { date: '2024-09-01', totalOrders: 20, successfulDeliveries: 18, failedDeliveries: 2, totalRevenue: 500 },
    { date: '2024-09-02', totalOrders: 25, successfulDeliveries: 23, failedDeliveries: 2, totalRevenue: 650 },
    { date: '2024-09-03', totalOrders: 30, successfulDeliveries: 28, failedDeliveries: 2, totalRevenue: 750 },
  ];

  // 模擬用戶行為數據
  const mockUserBehavior = {
    totalUsers: 500,
    dailyActiveUsers: 200,
    popularTimeSlots: ['12:00 PM - 1:00 PM', '6:00 PM - 7:00 PM', '8:00 PM - 9:00 PM'],
    averageSessionDuration: '15 mins',
  };

  // 模擬餐廳績效數據
  const mockRestaurantPerformance = [
    { name: 'Test Restaurant A', totalOrders: 50, averageRating: 4.5, totalRevenue: 3000.0 },
    { name: 'Test Restaurant B', totalOrders: 30, averageRating: 4.0, totalRevenue: 2000.0 },
    { name: 'Sample Eatery', totalOrders: 70, averageRating: 4.8, totalRevenue: 4500.0 },
    { name: 'Gourmet Place', totalOrders: 40, averageRating: 4.2, totalRevenue: 2500.0 },
    { name: 'Quick Bites', totalOrders: 20, averageRating: 3.9, totalRevenue: 1200.0 },
  ];

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-10">
      <div className="w-full max-w-6xl space-y-10">
        <h1 className="text-5xl font-extrabold mb-8 text-blue-900 text-center tracking-wide shadow-lg">
          管理員首頁
        </h1>

        {/* 登出按鈕 */}
        <div className="flex justify-end mb-6">
          <LogoutButton className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-300 transform hover:scale-105" />
        </div>

        {/* 系統監控 */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-blue-500">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 pb-4 border-gray-200">
            系統監控
          </h2>
          <OrderStatusMonitor filter={filter} onFilterChange={handleFilterChange} orders={mockOrderData} />
          <div className="mt-8">
            <OperationalStatusMonitor status={mockOperationalStatus} />
          </div>
          <div className="mt-8">
            <DeliveryPersonLocationMonitor locations={mockDeliveryPersonLocations} />
          </div>
        </section>

        {/* 用戶及餐廳管理 */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-green-500">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 pb-4 border-gray-200">
            用戶及餐廳管理
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserManagement users={mockUsers} />
            <RestaurantManagement restaurants={mockRestaurants} />
            <DeliveryPersonManagement deliveryPersons={mockDeliveryPersons} />
          </div>
        </section>

        {/* 數據報表與分析 */}
        <section className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-yellow-500">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b-2 pb-4 border-gray-200">
            數據報表與分析
          </h2>
          <div className="space-y-6">
            <SystemOperationReports reports={mockSystemReports} />
            <UserBehaviorAnalysis behavior={mockUserBehavior} />
            <RestaurantPerformanceAnalysis performance={mockRestaurantPerformance} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminHomePage;
