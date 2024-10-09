import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'; // 確保路徑正確

const LogoutButton = () => {
  const navigate = useNavigate(); // 用來導航的 hook

  // 處理登出邏輯
  const handleLogout = async () => {
    try {
      // 發送登出請求到後端
      await api.post('/auth/logout'); // 已經設置 baseURL 為 '/api'

      // 清除 LocalStorage 中的 token 和角色資訊
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');

      // 重新連接 Socket（如果有需要）
      // disconnectSocket(); // 根據您的實現情況

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