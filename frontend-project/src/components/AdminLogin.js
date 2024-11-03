import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/AdminLogin.js

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from "@services/authService"; // 使用別名導入 authService
import { UserContext } from "@context/UserContext"; // 使用別名導入 UserContext
import jwtDecode from 'jwt-decode';
import { reconnectSocket } from '@utils/socket'; // 使用別名導入 socket 相關函數
import Roles from '@shared/roles'; // 使用別名導入 Roles

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 定義 loading 狀態
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext); // 從 UserContext 獲取 setUser

  /**
   * 驗證電子郵件格式
   * @param {string} email - 用戶輸入的電子郵件
   * @returns {boolean} 是否為有效的電子郵件格式
   */
  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/;
    return emailRegex.test(email);
  };

  /**
   * 處理登錄表單提交
   * @param {Event} e - 表單提交事件
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    // 清空之前的錯誤信息
    setError('');
    setLoading(true); // 設置 loading 為 true

    // 基本驗證
    if (!email || !password) {
      setError('请输入电子邮件和密码');
      setLoading(false); // 完成後設置 loading 為 false
      return;
    }

    // 電子郵件格式驗證
    if (!validateEmail(email)) {
      setError('请输入有效的电子邮件地址');
      setLoading(false);
      return;
    }

    try {
      const { token, refreshToken, role } = await login(
        email,
        password,
        Roles.ADMIN
      );

      if (role === Roles.ADMIN) {
        // 解碼 Token 並更新 UserContext
        const decodedToken = jwtDecode(token);
        setUser({
          userId: decodedToken.userId,
          role: decodedToken.role,
          token: token,
        });

        // 保存 Token 到 sessionStorage
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('role', role);

        // 建立 Socket.IO 连接
        reconnectSocket();

        console.info('AdminLogin: 登录成功，导航至主页');
        navigate('/admin/home'); // 根據需求調整導航路徑
      } else {
        setError('您没有权限登录管理员系统');
      }
    } catch (error) {
      console.error('AdminLogin: 登录失败:', error);

      // 根據後端返回的狀態碼進行錯誤處理
      if (error.response) {
        switch (error.response.status) {
          case 400:
            setError('请求参数有误，请检查您的输入');
            break;
          case 401:
            setError('登录失败，账号或密码错误');
            break;
          case 403:
            setError('您没有权限登录管理员系统');
            break;
          case 500:
            setError('服务器错误，请稍后再试');
            break;
          default:
            setError('登录失败，请稍后再试');
        }
      } else if (error.request) {
        setError('无法连接到服务器，请检查您的网络连接');
      } else {
        setError('登录失败，请检查您的输入');
      }
    } finally {
      setLoading(false); // 无论成功或失败，都设置 loading 为 false
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          管理员登录
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              电子邮件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="输入电子邮件"
              required
              disabled={loading} // 根据 loading 状态禁用输入
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              密码
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              disabled={loading} // 根据 loading 状态禁用输入
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition ${
              loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={loading} // 根据 loading 状态禁用按钮
          >
            {loading ? '正在登录...' : '登录'}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-center mt-4 transition duration-300 ease-in-out">
            {error}
          </p>
        )}

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            还没有账户？
            <Link
              to="/admin/register"
              className="text-blue-500 hover:underline"
            >
              注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
