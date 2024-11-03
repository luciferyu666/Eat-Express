import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryLogin.js

import Roles from '@shared/roles'; // 使用別名導入 roles 文件
import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from "@services/authService"; // 使用別名導入 authService
import { UserContext } from "@context/UserContext"; // 使用別名導入 UserContext
import jwtDecode from 'jwt-decode';
import { reconnectSocket, disconnectSocket } from '@utils/socket'; // 使用別名導入 socket 相關函數
import validator from 'validator'; // 引入 validator 用於更可靠的電子郵件驗證
import PropTypes from 'prop-types'; // 引入 PropTypes 進行類型驗證

const DeliveryLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false; // 在組件卸載時避免更新狀態
    };
  }, []);

  /**
   * 處理登錄表單提交
   * @param {Event} e - 表單提交事件
   */
  const handleLogin = async (e) => {
    e.preventDefault();

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
    } else if (!validator.isEmail(trimmedEmail)) {
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
      const { token, refreshToken, role } = await login(
        trimmedEmail,
        password,
        Roles.DELIVERY_PERSON
      );

      if (role === Roles.DELIVERY_PERSON) {
        const decodedToken = jwtDecode(token);
        setUser({
          userId: decodedToken.userId,
          role: decodedToken.role,
          token: token,
        });

        console.info('DeliveryLogin: 登录成功，Token 已保存');

        // 斷開現有的 Socket 連接以防止重複連接
        disconnectSocket();

        // 建立新的 Socket.IO 連接
        reconnectSocket(token);

        // 將 Token 存儲在 sessionStorage
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('role', role);

        // 導航至首頁
        navigate('/delivery/home');
      } else {
        setErrorMessage('您没有权限登录外送员系统');
        console.warn('DeliveryLogin: 用户角色不匹配，无权登录外送员系统');
      }
    } catch (error) {
      console.error('DeliveryLogin: 登录失败:', error);
      let errorMsg = '登录失败，请检查网络连接';

      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMsg = data.error || '无效的请求，请检查您的输入';
            break;
          case 401:
            errorMsg = data.message || '无效的电子邮箱或密码';
            break;
          case 500:
            errorMsg = '服务器错误，请稍后再试';
            break;
          default:
            errorMsg = '登录失败，请检查电子邮箱和密码是否正确';
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = '请求超时，请检查网络连接';
      } else {
        errorMsg = error.message || '登录失败，请检查网络连接';
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
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">
        外送员登录
      </h1>
      <form
        onSubmit={handleLogin}
        className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md"
      >
        {/* 电子邮箱字段 */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-semibold mb-2"
          >
            电子邮箱
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 border ${
              fieldErrors.email ? 'border-red-500' : 'border-gray-300'
            } rounded-lg focus:outline-none focus:ring-2 ${
              fieldErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            required
            placeholder="输入您的电子邮箱"
            aria-invalid={!!fieldErrors.email}
            aria-describedby="email-error"
            autoComplete="email"
          />
          {fieldErrors.email && (
            <p id="email-error" className="text-red-500 text-sm mt-1">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* 密码字段 */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-semibold mb-2"
          >
            密码
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? 'focus:ring-red-500'
                  : 'focus:ring-blue-500'
              }`}
              required
              placeholder="输入您的密码"
              aria-invalid={!!fieldErrors.password}
              aria-describedby="password-error"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
            >
              {showPassword ? '隐藏' : '显示'}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="text-red-500 text-sm mt-1">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? '正在登录...' : '登录'}
        </button>

        {/* 全局错误信息显示 */}
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}

        {/* 注册链接 */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">还没有账号？</p>
          <Link
            to="/delivery/register"
            className="text-blue-500 hover:underline"
          >
            注册外送员账号
          </Link>
        </div>
      </form>
    </div>
  );
};

DeliveryLogin.propTypes = {
  // 如果组件接收 props，需要在此处定义
  // 例如：orderId: PropTypes.string.isRequired
};

export default DeliveryLogin;
