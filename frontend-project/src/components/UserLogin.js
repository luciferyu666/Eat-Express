import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/UserLogin.js

import React, { useState, useRef, useEffect } from 'react';
import axiosInstance from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { reconnectSocket, disconnectSocket } from '@utils/socket'; // 使用別名導入 socket 相關函數
import validator from 'validator'; // 引入 validator 庫，用於更可靠的電子郵件驗證
import PropTypes from 'prop-types'; // 引入 PropTypes 進行類型驗證

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isMounted = useRef(true); // 使用 useRef 初始化為 true

  useEffect(() => {
    return () => {
      isMounted.current = false; // 在組件卸載時設置為 false，避免內存洩漏
      disconnectSocket(); // 斷開 Socket 連接
    };
  }, []);

  /**
   * 驗證電子郵件格式
   * @param {string} email - 用戶輸入的電子郵件
   * @returns {boolean} 是否為有效的電子郵件格式
   */
  const validateEmail = (email) => {
    return validator.isEmail(email);
  };

  /**
   * 處理登入表單提交
   * @param {Event} e - 表單提交事件
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // 清空之前的錯誤信息
    setErrorMessage('');
    setFieldErrors({});
    setLoading(true);

    // 去除電子郵件兩端的空格
    const trimmedEmail = email.trim();

    let hasError = false;
    const newFieldErrors = {};

    // 檢查電子郵件字段
    if (!trimmedEmail) {
      newFieldErrors.email = '请输入电子邮箱';
      hasError = true;
    } else if (!validateEmail(trimmedEmail)) {
      newFieldErrors.email = '请输入有效的电子邮件地址';
      hasError = true;
    }

    // 檢查密碼字段
    if (!password) {
      newFieldErrors.password = '请输入密码';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      // 調用登入 API
      const response = await axiosInstance.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/login`,
        { email: trimmedEmail, password }
      );
      const { token, role, userId } = response.data;

      // 存儲令牌和用戶信息
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
      localStorage.setItem('userId', userId);

      // 建立 Socket.IO 連接
      reconnectSocket();

      // 根據用戶角色導航
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
      let errorMsg = '登入失敗，請檢查您的電子郵件和密碼。';

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMsg = data.error || '無效的請求，請檢查您的輸入';
            break;
          case 401:
            errorMsg = data.message || '無效的電子郵件或密碼';
            break;
          case 403:
            errorMsg = '您被禁止訪問此資源';
            break;
          case 500:
            errorMsg = '伺服器錯誤，請稍後再試';
            break;
          default:
            errorMsg = '登入失敗，請稍後再試';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = '請求超時，請檢查您的網絡連接';
      } else {
        errorMsg = error.message || '登入失敗，請檢查您的網絡連接';
      }

      if (isMounted.current) {
        setErrorMessage(errorMsg);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
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
          {/* 電子郵件字段 */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="輸入您的電子郵件"
              required
              disabled={loading} // 根據 loading 狀態禁用輸入
              className={`w-full px-4 py-2 border ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              aria-invalid={!!fieldErrors.email}
              aria-describedby="email-error"
              autoComplete="email"
            />
            {/* 電子郵件錯誤提示 */}
            {fieldErrors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* 密碼字段 */}
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="輸入您的密碼"
              required
              disabled={loading} // 根據 loading 狀態禁用輸入
              className={`w-full px-4 py-2 border ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
              aria-invalid={!!fieldErrors.password}
              aria-describedby="password-error"
              autoComplete="current-password"
            />
            {/* 密碼錯誤提示 */}
            {fieldErrors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* 提交按鈕 */}
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading} // 根據 loading 狀態禁用按鈕
          >
            {loading ? '正在登入...' : '登入'}
          </button>
        </form>

        {/* 註冊鏈接 */}
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

// 如果組件接收 props，需要在此處定義
UserLogin.propTypes = {
  // 例如：orderId: PropTypes.string.isRequired
};

export default UserLogin;
