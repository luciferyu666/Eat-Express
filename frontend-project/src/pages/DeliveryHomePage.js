import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/pages/DeliveryHomePage.js

import React from 'react';
import Notifications from '@components/DeliveryHome/Notifications';
import CurrentOrders from '@components/DeliveryHome/CurrentOrders';
import Navigation from '@components/DeliveryHome/Navigation';
import OrderStatusUpdater from '@components/DeliveryHome/OrderStatusUpdater';
import EarningsHistory from '@components/DeliveryHome/EarningsHistory';
import StatusToggle from '@components/DeliveryHome/StatusToggle';
import Support from '@components/DeliveryHome/Support';
import Profile from '@components/DeliveryHome/Profile';
import { DeliveryProvider } from '@context/DeliveryContext'; // 修改為 DeliveryProvider
import MapComponent from '@components/DeliveryHome/MapComponent'; // 引入地圖組件

const DeliveryHomePage = () => {
  return (
    <DeliveryProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">外送員首頁</h1>
            <StatusToggle />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <Notifications />
          </div>
          <div className="col-span-1">
            <CurrentOrders />
          </div>
          <div className="col-span-1">
            <Navigation />
          </div>
          <div className="col-span-1">
            <OrderStatusUpdater />
          </div>
          <div className="col-span-1">
            <EarningsHistory />
          </div>
          <div className="col-span-1">
            <Support />
          </div>
          <div className="col-span-1">
            <Profile />
          </div>
          {/* 地圖展示區 */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <MapComponent /> {/* 添加地圖組件 */}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-inner">
          <div className="max-w-7xl mx-auto py-4 px-6 lg:px-8 text-center text-gray-500">
            &copy; {new Date().getFullYear()} 食品外送系統. 版權所有。
          </div>
        </footer>
      </div>
    </DeliveryProvider>
  );
};

export default DeliveryHomePage;
