import { storeAuthToken } from "@utils/tokenStorage";
// src/components/NavigationBar.js

import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-gray-300">
            首页
          </Link>
        </li>
        <li>
          <Link to="/user/login" className="text-white hover:text-gray-300">
            用户登录
          </Link>
        </li>
        <li>
          <Link to="/user/register" className="text-white hover:text-gray-300">
            用户注册
          </Link>
        </li>
        {/* 其他导航链接 */}
      </ul>
    </nav>
  );
};

export default NavigationBar;
