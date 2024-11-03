import { storeAuthToken } from "@utils/tokenStorage";
// src/components/AdminRegister.js

import React, { useState } from 'react';
import axiosInstance from '@services/axiosConfig'; // 使用 axiosInstance
import { useNavigate, Link } from 'react-router-dom';

function AdminRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // 定義 loading 狀態
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    setErrorMessage('');
    setLoading(true);

    if (!username || !email || !password) {
      setErrorMessage('請填寫所有欄位');
      setLoading(false);
      return;
    }

    try {
      console.info('AdminRegister: 發送註冊請求', { username, email });

      const response = await axiosInstance.post('/auth/admin/register', {
        username,
        email,
        password,
      });

      if (response.status === 201) {
        console.info('AdminRegister: 註冊成功，導航至登入頁面');
        navigate('/admin/login');
      } else {
        throw new Error('註冊失敗');
      }
    } catch (error) {
      console.error('AdminRegister: 註冊失敗:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('註冊失敗，請檢查資料是否正確');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">管理員註冊</h1>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              用戶名
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="輸入您的用戶名"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="輸入您的電子郵件"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="輸入您的密碼"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
            disabled={loading}
          >
            {loading ? '正在註冊...' : '註冊'}
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            已有帳戶？{' '}
            <Link to="/admin/login" className="text-blue-600 hover:underline">
              登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
