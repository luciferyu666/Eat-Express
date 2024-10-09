// frontend-project/src/components/AdminHomePage/RestaurantManagement.js

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRestaurants();
  }, [search]);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants', { params: { search } });
      setRestaurants(response.data);
    } catch (error) {
      console.error('獲取餐廳失敗:', error);
    }
  };

  const handleDisable = async (restaurantId) => {
    try {
      await api.put(`/restaurants/${restaurantId}/disable`);
      fetchRestaurants();
    } catch (error) {
      console.error('禁用餐廳失敗:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">餐廳管理</h3>

      {/* 搜索欄 */}
      <input
        type="text"
        placeholder="搜索餐廳"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full"
      />

      {/* 餐廳列表 */}
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">餐廳ID</th>
            <th className="px-4 py-2">名稱</th>
            <th className="px-4 py-2">地址</th>
            <th className="px-4 py-2">狀態</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map(restaurant => (
            <tr key={restaurant.id} className="text-center border-t">
              <td className="px-4 py-2">{restaurant.id}</td>
              <td className="px-4 py-2">{restaurant.name}</td>
              <td className="px-4 py-2">{restaurant.address}</td>
              <td className="px-4 py-2">{restaurant.isActive ? '活躍' : '禁用'}</td>
              <td className="px-4 py-2">
                {restaurant.isActive ? (
                  <button
                    onClick={() => handleDisable(restaurant.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    禁用
                  </button>
                ) : (
                  <span>已禁用</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RestaurantManagement;
