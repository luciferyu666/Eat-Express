// frontend-project/src/components/AdminNavigation.js

import React from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const AdminNavigation = () => {
  return (
    <nav className="bg-blue-800 p-4 flex justify-between items-center">
      <div>
        <Link to="/admin/home" className="text-white font-bold text-xl">
          Admin Dashboard
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/admin/home" className="text-white">
          首頁
        </Link>
        <Link to="/admin/users" className="text-white">
          用戶管理
        </Link>
        <Link to="/admin/restaurants" className="text-white">
          餐廳管理
        </Link>
        <Link to="/admin/reports" className="text-white">
          報表分析
        </Link>
        <LogoutButton />
      </div>
    </nav>
  );
};

export default AdminNavigation;