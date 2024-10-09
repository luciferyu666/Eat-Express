// frontend-project/src/components/AdminHomePage/UserManagement.js

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { search } });
      setUsers(response.data);
    } catch (error) {
      console.error('獲取用戶失敗:', error);
    }
  };

  const handleDisable = async (userId) => {
    try {
      await api.put(`/users/${userId}/disable`);
      fetchUsers();
    } catch (error) {
      console.error('禁用用戶失敗:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">用戶管理</h3>

      {/* 搜索欄 */}
      <input
        type="text"
        placeholder="搜索用戶"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-3 py-2 border rounded w-full"
      />

      {/* 用戶列表 */}
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2">用戶ID</th>
            <th className="px-4 py-2">姓名</th>
            <th className="px-4 py-2">電子郵件</th>
            <th className="px-4 py-2">狀態</th>
            <th className="px-4 py-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="text-center border-t">
              <td className="px-4 py-2">{user.id}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.isActive ? '活躍' : '禁用'}</td>
              <td className="px-4 py-2">
                {user.isActive ? (
                  <button
                    onClick={() => handleDisable(user.id)}
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

export default UserManagement;
