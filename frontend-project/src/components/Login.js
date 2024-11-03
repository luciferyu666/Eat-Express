import { storeAuthToken } from "@utils/tokenStorage";
// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 向後端發送登入請求
      const response = await axios.post(
        'http://localhost:5000/api/auth/login',
        {
          email,
          password,
        }
      );

      // 從後端返回的資料中取得 JWT token
      const { token } = response.data;

      // 將 token 存儲在 localStorage 中
      localStorage.setItem('authToken', token);

      // 呼叫父組件的 onLoginSuccess 方法
      onLoginSuccess();

      // 重置錯誤狀態
      setError('');
    } catch (err) {
      setError('登入失敗，請檢查您的憑證');
    }
  };

  return (
    <div>
      <h2>登入</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>密碼:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">登入</button>
      </form>
    </div>
  );
};

export default Login;
