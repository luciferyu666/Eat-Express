// src/components/DeliveryLogin.js

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { reconnectSocket } from '../socket';

const DeliveryLogin = () => {
  const [email, setEmail] = useState(''); // 用來存儲電子郵件
  const [password, setPassword] = useState(''); // 用來存儲密碼
  const [errorMessage, setErrorMessage] = useState(''); // 存儲錯誤信息
  const navigate = useNavigate(); // 用來導航的 hook

  // 處理登入邏輯
  const handleLogin = async (e) => {
    e.preventDefault();

    // 檢查是否有空白字段
    if (!email || !password) {
      setErrorMessage('請輸入電子郵件和密碼');
      return;
    }

    try {
      // 發送登入請求到後端，使用相對路徑
      const response = await axios.post('/api/auth/delivery-login', {
        email,
        password,
      });

      // 確認返回的數據
      console.log('登入響應數據:', response.data); // 打印出響應數據以檢查其內容

      // 從響應中提取 token 和角色
      const { token, role } = response.data;

      // 檢查是否是外送員角色
      if (role === 'delivery_person') {
        // 儲存 token 和角色到 localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('role', role);

        // 重新連接 Socket 以傳送新的 Token
        reconnectSocket();

        // 導航到外送員首頁
        navigate('/delivery/home');
      } else {
        // 如果角色不匹配，顯示錯誤消息
        setErrorMessage('您沒有權限登入外送員系統');
      }
    } catch (error) {
      // 處理登入失敗的情況
      console.error('登入失敗:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('登入失敗，請檢查電子郵件和密碼是否正確');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">外送員登入</h1>
      <form onSubmit={handleLogin} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
            電子郵件
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
            密碼
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          登入
        </button>

        {/* 顯示錯誤訊息 */}
        {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}

        {/* 新增註冊功能的連結 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">還沒有帳號？</p>
          <Link to="/delivery/register" className="text-blue-500 hover:underline">
            註冊外送員帳號
          </Link>
        </div>
      </form>
    </div>
  );
}

export default DeliveryLogin;