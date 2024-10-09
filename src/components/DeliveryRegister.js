// src/components/DeliveryRegister.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DeliveryRegister() {
  const [deliveryPersonName, setDeliveryPersonName] = useState(''); // 用來存儲外送員姓名
  const [email, setEmail] = useState(''); // 用來存儲電子郵件
  const [password, setPassword] = useState(''); // 用來存儲密碼
  const [errorMessage, setErrorMessage] = useState(''); // 用來存儲錯誤訊息
  const [successMessage, setSuccessMessage] = useState(''); // 用來存儲成功訊息
  const navigate = useNavigate(); // 用來導航的 hook

  // 處理註冊邏輯
  const handleRegister = async (e) => {
    e.preventDefault();

    // 檢查是否有空白字段
    if (!deliveryPersonName || !email || !password) {
      setErrorMessage('請輸入所有欄位');
      return;
    }

    try {
      // 發送註冊請求到後端
      const response = await axios.post('http://localhost:5000/api/auth/delivery-register', {
        deliveryPersonName,
        email,
        password,
      });

      const { message } = response.data;

      // 顯示註冊成功訊息並導航到登入頁面
      setSuccessMessage(message);
      setTimeout(() => {
        navigate('/delivery/login');
      }, 2000); // 2秒後跳轉到登入頁面
    } catch (error) {
      console.error('註冊失敗:', error);
      setErrorMessage('註冊失敗，請檢查電子郵件是否已經註冊或輸入資料是否正確');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">外送員註冊</h1>
      <form onSubmit={handleRegister} className="max-w-md mx-auto">
        <div className="mb-4">
          <label htmlFor="deliveryPersonName" className="block text-gray-700 font-semibold mb-2">姓名</label>
          <input
            type="text"
            id="deliveryPersonName"
            value={deliveryPersonName}
            onChange={(e) => setDeliveryPersonName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">電子郵件</label>
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
          <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">密碼</label>
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
          註冊
        </button>

        {/* 顯示錯誤訊息 */}
        {errorMessage && <p className="text-red-500 text-center mt-4">{errorMessage}</p>}

        {/* 顯示成功訊息 */}
        {successMessage && <p className="text-green-500 text-center mt-4">{successMessage}</p>}
      </form>
    </div>
  );
}

export default DeliveryRegister;
