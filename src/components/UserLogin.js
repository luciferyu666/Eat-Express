// src/components/UserLogin.js

import React, { useState } from 'react';
import api from '../utils/api'; // 確保路徑正確
import { useNavigate, Link } from 'react-router-dom';
import { reconnectSocket } from '../socket';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // 處理登入表單提交
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 發送登入請求
      const response = await api.post('/auth/login', { email, password });
      const { token, role, userId } = response.data;

      // 儲存 Token 和用戶資訊到 localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // 重新連接 Socket 以傳送新的 Token
      reconnectSocket();

      // 根據角色導航至相應的首頁
      switch (role) {
        case 'customer':
          navigate('/user/home');
          break;
        case 'restaurant':
          navigate('/restaurant/home');
          break;
        case 'delivery_person':
          navigate('/delivery/home');
          break;
        case 'admin':
          navigate('/admin/home');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('登入失敗:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('登入失敗，請檢查您的電子郵件和密碼。');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">用戶登入</h1>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="輸入您的電子郵件"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入您的密碼"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            登入
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            還沒有帳戶？{' '}
            <Link to="/user/register" className="text-blue-500 hover:underline">
              註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;