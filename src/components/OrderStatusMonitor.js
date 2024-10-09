// src/components/OrderStatusMonitor.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrderStatusMonitor = ({ filter, onFilterChange }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 從後端獲取活躍訂單
    axios.get('/api/orders/active')
      .then(response => setOrders(response.data))
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  // 根據篩選條件過濾訂單
  const filteredOrders = orders.filter(order => 
    (!filter.restaurant || order.restaurantName.includes(filter.restaurant)) &&
    (!filter.user || order.userName.includes(filter.user)) &&
    (!filter.delivery || order.deliveryPersonName.includes(filter.delivery))
  );

  return (
    <div className="order-status-monitor mb-4">
      <h3 className="text-xl font-semibold mb-2">訂單狀態監控</h3>

      {/* 篩選選項 */}
      <div className="mb-4">
        <label className="mr-2">
          餐廳:
          <input 
            type="text" 
            name="restaurant" 
            value={filter.restaurant} 
            onChange={onFilterChange}
            className="border rounded px-2 py-1 ml-1"
          />
        </label>
        <label className="mr-2">
          用戶:
          <input 
            type="text" 
            name="user" 
            value={filter.user} 
            onChange={onFilterChange}
            className="border rounded px-2 py-1 ml-1"
          />
        </label>
        <label className="mr-2">
          外送員:
          <input 
            type="text" 
            name="delivery" 
            value={filter.delivery} 
            onChange={onFilterChange}
            className="border rounded px-2 py-1 ml-1"
          />
        </label>
      </div>

      {/* 訂單表格 */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4">訂單編號</th>
            <th className="py-2 px-4">用戶</th>
            <th className="py-2 px-4">餐廳</th>
            <th className="py-2 px-4">外送員</th>
            <th className="py-2 px-4">狀態</th>
            <th className="py-2 px-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order.id} className="text-center">
              <td className="py-2 px-4">{order.id}</td>
              <td className="py-2 px-4">{order.userName}</td>
              <td className="py-2 px-4">{order.restaurantName}</td>
              <td className="py-2 px-4">{order.deliveryPersonName}</td>
              <td className="py-2 px-4">{order.status}</td>
              <td className="py-2 px-4">
                <button className="bg-blue-500 text-white px-2 py-1 rounded">查看詳情</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderStatusMonitor;