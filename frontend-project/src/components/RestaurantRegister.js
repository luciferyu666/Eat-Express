// RestaurantRegister.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RestaurantRegister = () => {
  const [restaurantName, setRestaurantName] = useState('');  // 儲存餐廳名稱
  const [email, setEmail] = useState('');                   // 儲存電子郵件
  const [password, setPassword] = useState('');             // 儲存密碼
  const [errorMessage, setErrorMessage] = useState('');     // 儲存錯誤信息
  const navigate = useNavigate();                           // 用來導航的 hook

  // 處理註冊表單提交
  const handleRegister = async (e) => {
    e.preventDefault();

    // 打印前端傳遞的數據，確保它是正確的
    console.log('前端傳遞的數據:', { restaurantName, email, password });

    try {
      // 發送餐廳註冊請求到後端
      const response = await axios.post('http://localhost:5000/api/auth/restaurant-register', {
        email,
        password,
        restaurantName,
      });

      // 假設註冊成功後返回 token
      const { token } = response.data;
      localStorage.setItem('authToken', token);            // 儲存 token
      localStorage.setItem('role', 'restaurant');          // 儲存角色為餐廳

      // 註冊成功後導航到餐廳登入頁面
      navigate('/restaurant/login');
    } catch (error) {
      console.error('註冊失敗:', error);
      setErrorMessage('註冊失敗，請檢查資料是否正確');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">餐廳註冊</h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="restaurantName" className="block text-gray-700 font-semibold mb-2">
              餐廳名稱
            </label>
            <input
              type="text"
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="輸入餐廳名稱"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
              電子郵件
            </label>
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
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
              密碼
            </label>
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
            註冊
          </button>
        </form>

        {/* 顯示錯誤訊息 */}
        {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default RestaurantRegister;
