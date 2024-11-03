import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/LogoutButton.js

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'axios'; // 使用 axios 直接
import { UserContext } from '@context/UserContext'; // 引入 UserContext
import { disconnectSocket } from '@utils/socket'; // 引入 disconnectSocket

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const LogoutButton = () => {
  const navigate = useNavigate(); // 用來導航的 hook
  const { setUser } = useContext(UserContext);

  // 處理登出邏輯
  const handleLogout = async () => {
    try {
      // 發送登出請求到後端
      await axiosInstance.post(`${API_BASE_URL}/auth/logout`, null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // 使用統一的 'token'
        },
      });

      // 清除 LocalStorage 中的 token 和角色資訊
      localStorage.removeItem('token'); // 統一使用 'token'
      localStorage.removeItem('role');
      localStorage.removeItem('userId');

      // 更新 UserContext
      setUser({ token: null, role: null });

      // 關閉 Socket 連接
      disconnectSocket();

      // 導航到應用程式的入口頁面
      navigate('/', { replace: true });
    } catch (error) {
      console.error('登出失敗:', error);
      alert('登出失敗，請稍後再試。');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
    >
      登出
    </button>
  );
};

export default LogoutButton;
