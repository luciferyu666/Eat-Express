import { storeAuthToken } from "@utils/tokenStorage";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from 'axios';

function UserRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/register`,
        {
          email,
          password,
          username,
        }
      );

      const { token } = response.data;
      localStorage.setItem('authToken', token);
      navigate('/');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('註冊失敗，請檢查您的資料並重試');
      }
      console.error('註冊失敗:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">用戶註冊</h1>

        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 font-bold mb-2"
            >
              用戶名
            </label>
            <input
              id="username"
              type="text"
              className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
              placeholder="輸入您的用戶名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              電子郵件
            </label>
            <input
              id="email"
              type="email"
              className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
              placeholder="輸入您的電子郵件"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              密碼
            </label>
            <input
              id="password"
              type="password"
              className="w-full p-3 border rounded focus:outline-none focus:border-blue-500"
              placeholder="輸入您的密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition duration-300"
          >
            註冊
          </button>
        </form>

        <p className="text-center mt-4">
          已經有帳戶了嗎？{' '}
          <a href="/user/login" className="text-blue-500 hover:underline">
            登入
          </a>
        </p>
      </div>
    </div>
  );
}

export default UserRegister;
