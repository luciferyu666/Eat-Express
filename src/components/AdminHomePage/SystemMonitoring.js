// frontend-project/src/components/AdminHomePage/SystemMonitoring.js

import React, { useEffect, useState } from 'react';
import api from '../../utils/api'; // Axios 實例
import OrderStatusMonitor from './OrderStatusMonitor';
import OperationalStatusMonitor from './OperationalStatusMonitor';
import DeliveryLocationMonitor from './DeliveryLocationMonitor';

const SystemMonitoring = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">系統監控</h2>
      
      {/* 訂單狀態監控 */}
      <OrderStatusMonitor />

      {/* 運營狀況監控 */}
      <OperationalStatusMonitor />

      {/* 外送員位置監控 */}
      <DeliveryLocationMonitor />
    </div>
  );
};

export default SystemMonitoring;
