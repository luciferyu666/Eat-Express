// src/components/RestaurantManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RestaurantManagement = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    // 從後端獲取餐廳數據
    const fetchRestaurants = async () => {
      try {
        // 修改為完整的後端 URL，確保端口和路徑正確
        const response = await axios.get('http://localhost:5000/api/restaurants');
        setRestaurants(response.data);
      } catch (error) {
        console.error('獲取餐廳數據失敗', error);
      }
    };

    fetchRestaurants();
  }, []);

  const handleEditRestaurant = (restaurantId) => {
    // 跳轉到編輯頁面或彈出編輯窗口的邏輯
    console.log(`編輯餐廳: ${restaurantId}`);
    // 此處可以添加路由跳轉邏輯，或顯示編輯表單
  };

  const handleDisableRestaurant = async (restaurantId) => {
    // 禁用餐廳的邏輯
    try {
      // 修改為完整的後端 URL，確保端口和路徑正確
      await axios.post(`http://localhost:5000/api/restaurants/${restaurantId}/disable`);
      setRestaurants(restaurants.map(restaurant => restaurant.id === restaurantId ? { ...restaurant, disabled: true } : restaurant));
    } catch (error) {
      console.error('禁用餐廳失敗', error);
    }
  };

  return (
    <div className="restaurant-management mb-4">
      <h3 className="text-xl font-semibold mb-2">餐廳管理</h3>
      {/* 餐廳表格 */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4">餐廳ID</th>
            <th className="py-2 px-4">名稱</th>
            <th className="py-2 px-4">地址</th>
            <th className="py-2 px-4">狀態</th>
            <th className="py-2 px-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map(restaurant => (
            <tr key={restaurant.id} className="text-center">
              <td className="py-2 px-4">{restaurant.id}</td>
              <td className="py-2 px-4">{restaurant.name}</td>
              <td className="py-2 px-4">{restaurant.address}</td>
              <td className="py-2 px-4">{restaurant.disabled ? '禁用' : '正常'}</td>
              <td className="py-2 px-4">
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleEditRestaurant(restaurant.id)}
                >
                  編輯
                </button>
                <button
                  className={`px-2 py-1 rounded ${restaurant.disabled ? 'bg-gray-500' : 'bg-red-500 text-white'}`}
                  onClick={() => handleDisableRestaurant(restaurant.id)}
                  disabled={restaurant.disabled}
                >
                  {restaurant.disabled ? '已禁用' : '禁用'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RestaurantManagement;
