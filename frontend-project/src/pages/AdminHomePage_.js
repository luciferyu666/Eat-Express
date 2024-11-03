import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/pages/AdminHomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import SystemMonitoring from '@components/AdminHomePage/SystemMonitoring';
import UserManagement from '@components/AdminHomePage/UserManagement';
import RestaurantManagement from '@components/AdminHomePage/RestaurantManagement';
import DataReports from '@components/AdminHomePage/DataReports';
import Navigation from '@components/Navigation'; // 假設有一個導航組件

const AdminHomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* 頂部導航欄 */}
      <Navigation />

      {/* 主內容區域 */}
      <div className="flex-1 p-6 bg-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center">管理員首頁</h1>

        {/* 系統監控模塊 */}
        <SystemMonitoring />

        {/* 用戶及餐廳管理模塊 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <UserManagement />
          <RestaurantManagement />
        </div>

        {/* 數據報表與分析模塊 */}
        <div className="mt-8">
          <DataReports />
        </div>
      </div>
    </div>
  );
};

export default AdminHomePage;
