import { storeAuthToken } from "@utils/tokenStorage";
// src/pages/HomePage.js

import React from 'react';
import { Link } from 'react-router-dom'; // 使用 Link 進行導航

const HomePage = () => {
  console.log('HomePage rendered'); // 添加這行，確認 HomePage 組件是否被渲染

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-white mb-8">
        歡迎來到食品外送平台
      </h1>

      <div className="w-full max-w-md bg-white bg-opacity-80 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          請選擇您的身份登入
        </h2>
        <div className="flex flex-col space-y-4">
          <Link
            to="/user/login"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-200 text-center"
          >
            用戶登入
          </Link>
          <Link
            to="/restaurants/login"
            className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-200 text-center"
          >
            餐廳登入
          </Link>
          <Link
            to="/delivery/login"
            className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-200 text-center"
          >
            外送員登入
          </Link>
          <Link
            to="/admin/login"
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200 text-center"
          >
            管理員登入
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
