import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/RestaurantRegister.js

import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import { UserContext } from "@context/UserContext"; // 使用別名導入 UserContext
import { reconnectSocket, disconnectSocket } from '@utils/socket'; // 使用別名導入 socket 相關函數
import validator from 'validator'; // 引入 validator 庫，用於更可靠的電子郵件驗證
import PropTypes from 'prop-types'; // 引入 PropTypes 進行類型驗證

const RestaurantRegister = () => {
  const [restaurantName, setRestaurantName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    restaurantName: '',
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

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
   * 驗證密碼強度
   * @param {string} password - 用戶輸入的密碼
   * @returns {boolean} 是否符合強密碼要求
   */
  const validatePassword = (password) => {
    // 密碼至少包含8個字符，包含字母和數字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  };

  /**
   * 處理註冊表單提交
   * @param {Event} e - 表單提交事件
   */
  const handleRegister = async (e) => {
    e.preventDefault();

    // 清空之前的錯誤信息
    setErrorMessage('');
    setFieldErrors({
      restaurantName: '',
      email: '',
      password: '',
    });
    setLoading(true);

    // 去除電子郵件兩端的空格
    const trimmedEmail = email.trim();

    let hasError = false;
    const newFieldErrors = {};

    // 檢查餐廳名稱字段
    if (!restaurantName.trim()) {
      newFieldErrors.restaurantName = '請輸入餐廳名稱';
      hasError = true;
    }

    // 檢查電子郵件字段
    if (!trimmedEmail) {
      newFieldErrors.email = '請輸入電子郵件';
      hasError = true;
    } else if (!validateEmail(trimmedEmail)) {
      newFieldErrors.email = '請輸入有效的電子郵件地址';
      hasError = true;
    }

    // 檢查密碼字段
    if (!password) {
      newFieldErrors.password = '請輸入密碼';
      hasError = true;
    } else if (!validatePassword(password)) {
      newFieldErrors.password = '密碼至少包含8個字符，並包含字母和數字';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      setLoading(false);
      return;
    }

    try {
      // 調用註冊 API
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/auth/register/restaurant`,
        {
          email: trimmedEmail,
          password,
          restaurantName: restaurantName.trim(),
        }
      );

      const { token, refreshToken, role } = response.data;
      // 存儲令牌和用戶信息
      sessionStorage.setItem('authToken', token); // 考慮使用 sessionStorage 提高安全性
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('role', role);
      sessionStorage.setItem('userId', jwtDecode(token).userId);

      // 更新 UserContext
      const decoded = jwtDecode(token);
      setUser({
        userId: decoded.userId,
        role: decoded.role,
        token: token,
      });

      console.info('RestaurantRegister: 註冊成功，Token 已保存');

      // 斷開現有的 Socket 連接以防止重複連接
      disconnectSocket();

      // 建立新的 Socket.IO 連接
      reconnectSocket(token); // 假設 reconnectSocket 可以接受 token 作為參數

      // 導航至餐廳首頁
      navigate('/restaurants/home');
    } catch (error) {
      console.error('註冊失敗:', error);
      let errorMsg = '註冊失敗，請檢查資料是否正確';

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMsg = data.error || '無效的請求，請檢查您的輸入';
            break;
          case 409:
            errorMsg = '該電子郵件已被註冊';
            break;
          case 500:
            errorMsg = '伺服器錯誤，請稍後再試';
            break;
          default:
            errorMsg = '註冊失敗，請稍後再試';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = '請求超時，請檢查您的網絡連接';
      } else {
        errorMsg = error.message || '註冊失敗，請檢查您的網絡連接';
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          餐廳註冊
        </h1>

        {/* 全局錯誤信息顯示 */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* 餐廳名稱字段 */}
          <div>
            <label
              htmlFor="restaurantName"
              className="block text-gray-700 font-semibold mb-2"
            >
              餐廳名稱
            </label>
            <input
              type="text"
              id="restaurantName"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="輸入餐廳名稱"
              required
              disabled={loading} // 根據 loading 狀態禁用輸入
              className={`w-full px-4 py-2 border ${
                fieldErrors.restaurantName
                  ? 'border-red-500'
                  : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.restaurantName
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
              aria-invalid={!!fieldErrors.restaurantName}
              aria-describedby="restaurantName-error"
              autoComplete="organization"
            />
            {/* 餐廳名稱錯誤提示 */}
            {fieldErrors.restaurantName && (
              <p
                id="restaurantName-error"
                className="text-red-500 text-sm mt-1"
              >
                {fieldErrors.restaurantName}
              </p>
            )}
          </div>

          {/* 電子郵件字段 */}
          <div>
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
              placeholder="輸入電子郵件"
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
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="輸入密碼"
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
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? '隱藏' : '顯示'}
              </button>
            </div>
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
            className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading} // 根據 loading 狀態禁用按鈕
          >
            {loading ? '正在註冊中...' : '註冊'}
          </button>
        </form>

        {/* 登入鏈接 */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            已有帳戶？
            <Link
              to="/restaurants/login"
              className="text-blue-500 hover:underline"
            >
              登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// 如果組件接收 props，需要在此處定義
RestaurantRegister.propTypes = {
  // 例如：orderId: PropTypes.string.isRequired
};

export default RestaurantRegister;
