// src/components/AdminRegister.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function AdminRegister() {
  const [username, setUsername] = useState('');             // 新增存储用户名
  const [email, setEmail] = useState('');                   // 存储电子邮件
  const [password, setPassword] = useState('');             // 存储密码
  const [errorMessage, setErrorMessage] = useState('');     // 存储错误信息
  const navigate = useNavigate();                           // 用于导航的钩子

  // 处理注册表单提交
  const handleRegister = async (e) => {
    e.preventDefault();

    // 打印前端传递的数据，确保它是正确的
    console.log('前端传递的数据信息:', { username, email, password }); // 打印前端传递的数据信息

    try {
      // 发送管理员注册请求到后端
      const response = await axios.post('http://localhost:5000/api/auth/admin/register', {
        username, // 包含 username
        email,
        password,
      });

      // 检查后端是否返回成功的响应
      if (response.status === 201) {  // 201 状态码表示成功创建资源
        // 注册成功后导航到管理员登录页面
        navigate('/admin/login');
      } else {
        throw new Error('注册失败');
      }
    } catch (error) {
      console.error('注册失败:', error);
      // 检查后端返回的错误信息，并显示在页面上
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('注册失败，请检查资料是否正确');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">管理员注册</h1>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleRegister}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // 确保更新 username
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="输入您的用户名"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">电子邮件</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="输入您的电子邮件"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
              placeholder="输入您的密码"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition duration-300"
          >
            注册
          </button>
        </form>
        <div className="mt-4 text-center">
          <p>
            已有账号？{' '}
            <Link to="/admin/login" className="text-blue-600 hover:underline">
              登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;
