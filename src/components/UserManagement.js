// src/components/UserManagement.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 從後端獲取用戶數據
    const fetchUsers = async () => {
      try {
        // 修改為完整的後端 URL，確保端口和路徑正確
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('獲取用戶數據失敗', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDisableUser = async (userId) => {
    // 禁用用戶的邏輯
    try {
      // 修改為完整的後端 URL，確保端口和路徑正確
      await axios.post(`http://localhost:5000/api/users/${userId}/disable`);
      setUsers(users.map(user => user.id === userId ? { ...user, disabled: true } : user));
    } catch (error) {
      console.error('禁用用戶失敗', error);
    }
  };

  return (
    <div className="user-management mb-4">
      <h3 className="text-xl font-semibold mb-2">用戶管理</h3>
      {/* 用戶表格 */}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4">用戶ID</th>
            <th className="py-2 px-4">姓名</th>
            <th className="py-2 px-4">聯絡方式</th>
            <th className="py-2 px-4">狀態</th>
            <th className="py-2 px-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="text-center">
              <td className="py-2 px-4">{user.id}</td>
              <td className="py-2 px-4">{user.name}</td>
              <td className="py-2 px-4">{user.contact}</td>
              <td className="py-2 px-4">{user.disabled ? '禁用' : '正常'}</td>
              <td className="py-2 px-4">
                <button
                  className={`px-2 py-1 rounded ${user.disabled ? 'bg-gray-500' : 'bg-red-500 text-white'}`}
                  onClick={() => handleDisableUser(user.id)}
                  disabled={user.disabled}
                >
                  {user.disabled ? '已禁用' : '禁用'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
