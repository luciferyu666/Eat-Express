// frontend-project/src/components/RestaurantLogin.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // 使用命名匯入
import { UserContext } from '../context/UserContext'; // 引入 UserContext
import { reconnectSocket } from '../socket'; // 使用命名匯入 reconnectSocket

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const RestaurantLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // 從上下文中獲取 setUser

  // 在組件掛載時檢查用戶是否已經登入
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    if (token && role === 'restaurant') {
      navigate('/restaurants/home'); // 如果已登入，直接導航到餐廳主頁
    }
  }, [navigate]);

  // 檢查 Token 的時間戳
  const checkTokenTime = (token) => {
    try {
      // 解碼 Token
      const decodedToken = jwtDecode(token); // 使用正確的解碼函數

      // 打印 Token 內容
      console.log('解碼的 Token:', decodedToken);

      // 提取 `iat`（簽發時間）字段
      const issuedAt = decodedToken.iat; // 這是 Unix 時間戳，單位是秒
      const issuedDate = new Date(issuedAt * 1000); // 轉換為 JS Date

      // 打印 `iat` 的日期時間
      console.log(`Token 簽發於: ${issuedDate.toISOString()}`);

      // 獲取當前時間並計算差異
      const currentTime = Math.floor(Date.now() / 1000);
      const currentDate = new Date(currentTime * 1000);
      console.log(`當前時間: ${currentDate.toISOString()}`);

      // 計算時間差
      const timeDifference = currentTime - issuedAt; // 單位：秒
      console.log(`前後端時間差異（秒）: ${timeDifference}`);

      // 假設允許的最大時間差為 10 秒
      const allowedTimeDifference = 10;
      if (Math.abs(timeDifference) > allowedTimeDifference) {
        console.warn('前後端時間不同步，請檢查系統時間設置！');
      } else {
        console.log('前後端時間同步正確。');
      }
    } catch (error) {
      console.error('解碼 Token 時發生錯誤:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(''); // 清除之前的錯誤
    try {
      // 發送登入請求到後端
      const { data } = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      // 確認返回的角色是餐廳
      if (data.role !== 'restaurant') {
        setLoginError('無效的帳號，這不是一個餐廳用戶');
        return;
      }

      // 將 token 和角色存入 localStorage
      if (rememberMe) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('role', 'restaurant');
      } else {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('role', 'restaurant');
      }

      // 更新 UserContext
      const decoded = jwtDecode(data.token);
      setUser({
        userId: decoded.userId,
        role: decoded.role,
        // 如果有其他欄位，如 restaurantId，deliveryId 等，添加在這裡
      });

      // 檢查 Token 的時間戳以確認時間同步
      checkTokenTime(data.token);

      // 重新連接 Socket 以傳送新的 Token
      reconnectSocket();

      // 成功登入後導航到餐廳首頁
      navigate('/restaurants/home'); // 使用正確的路徑
    } catch (error) {
      console.error('登入失敗:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setLoginError(error.response.data.message);
      } else {
        setLoginError('登入失敗，請檢查帳號或密碼是否正確');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">餐廳登入</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">電子郵件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPassword(e.target.value)}
              placeholder="輸入密碼"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberMe" className="text-gray-700">記住我</label>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? '正在登入中...' : '登入'}
          </button>
        </form>

        {loginError && <p className="text-red-500 text-center mt-4">{loginError}</p>}

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            還沒有帳戶？
            <Link to="/restaurants/register" className="text-blue-500 hover:underline">
              註冊
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RestaurantLogin;
