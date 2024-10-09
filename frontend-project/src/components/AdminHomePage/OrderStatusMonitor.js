// frontend-project/src/components/AdminHomePage/OrderStatusMonitor.js

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const OrderStatusMonitor = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState({ restaurant: '', deliveryPerson: '', user: '' });

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders', { params: filter });
      setOrders(response.data);
    } catch (error) {
      console.error('獲取訂單失敗:', error);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold mb-2">訂單狀態監控</h3>
      
      {/* 篩選選項 */}
      <div className="flex space-x-4 mb-4">
        <input
          type="text"
          placeholder="餐廳名稱"
          value={filter.restaurant}
          onChange={(e) => setFilter({ ...filter, restaurant: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="外送員名稱"
          value={filter.deliveryPerson}
          onChange={(e) => setFilter({ ...filter, deliveryPerson: e.target.value })}
          className="px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="用戶名稱"
          value={filter.user}
          onChange={(e) => setFilter({ ...filter, user: e.target.value })}
          className="px-3 py-2 border rounded"
        />
      </div>

      {/* 訂單列表 */}
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">訂單ID</th>
            <th className="px-4 py-2">用戶</th>
            <th className="px-4 py-2">餐廳</th>
            <th className="px-4 py-2">外送員</th>
            <th className="px-4 py-2">狀態</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="text-center border-t">
              <td className="px-4 py-2">{order.id}</td>
              <td className="px-4 py-2">{order.userName}</td>
              <td className="px-4 py-2">{order.restaurantName}</td>
              <td className="px-4 py-2">{order.deliveryPersonName}</td>
              <td className="px-4 py-2">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderStatusMonitor;
