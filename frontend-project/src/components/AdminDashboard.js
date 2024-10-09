import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  // 獲取所有用戶列表
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('無法獲取用戶列表', error);
      }
    };

    fetchUsers();
  }, []);

  // 獲取所有餐廳列表
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('/api/restaurants');
        setRestaurants(response.data);
      } catch (error) {
        console.error('無法獲取餐廳列表', error);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1>管理員後台</h1>

      {/* 顯示用戶列表 */}
      <section>
        <h2>用戶列表</h2>
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              用戶名: {user.username} - 電子郵件: {user.email} - 角色: {user.role}
            </li>
          ))}
        </ul>
      </section>

      {/* 顯示餐廳列表 */}
      <section>
        <h2>餐廳列表</h2>
        <ul>
          {restaurants.map((restaurant) => (
            <li key={restaurant._id}>
              餐廳名稱: {restaurant.name} - 地址: {restaurant.address}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminDashboard;
