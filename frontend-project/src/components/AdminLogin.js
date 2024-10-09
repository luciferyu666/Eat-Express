// src/components/AdminLogin.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 引入 Link 用於導航至註冊頁面
import axios from 'axios';
import { reconnectSocket } from '../socket';

const AdminLogin = () => {
  const [email, setEmail] = useState('');      // 存儲電子郵件的狀態
  const [password, setPassword] = useState(''); // 存儲密碼的狀態
  const [error, setError] = useState('');       // 存儲登錄錯誤信息
  const navigate = useNavigate();               // 用來導航的 hook

  // 處理登錄表單提交
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 發送登錄請求到後端
      const { data } = await axios.post('http://localhost:5000/api/auth/admin/login', { email, password });

      // 將 token 和角色存入 localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('role', 'admin');  // 這裡存儲角色為 admin

      // 重新連接 Socket 以傳送新的 Token
      reconnectSocket();

      // 成功登錄後導航到管理員首頁
      navigate('/admin/home');
    } catch (error) {
      console.error('登錄失敗:', error);

      // 顯示具體的錯誤信息
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error); // 使用後端返回的錯誤信息
      } else {
        setError('登錄失敗，請檢查賬號或密碼是否正確');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">管理員登入</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="輸入電子郵件"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">密碼</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入密碼"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
          >
            登入
          </button>
        </form>

        {/* 顯示登錄錯誤信息 */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}

        {/* 添加註冊導航 */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            還沒有帳戶？
            <Link to="/admin/register" className="text-blue-500 hover:underline">
              註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;