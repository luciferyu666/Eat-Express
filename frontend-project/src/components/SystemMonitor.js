// src/components/SystemMonitor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemMonitor = () => {
  const [systemData, setSystemData] = useState({
    activeRestaurants: 0,
    activeDelivery: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    axios.get('/api/system-status')
      .then(response => setSystemData(response.data))
      .catch(error => console.error('Error fetching system status:', error));
  }, []);

  return (
    <div>
      <h2>系統運營狀況</h2>
      <p>活躍餐廳數量: {systemData.activeRestaurants}</p>
      <p>活躍外送員數量: {systemData.activeDelivery}</p>
      <p>活躍用戶數量: {systemData.activeUsers}</p>

      {/* 添加異常告警的通知 */}
      {systemData.alerts && systemData.alerts.length > 0 && (
        <div className="alerts">
          <h3>告警通知:</h3>
          <ul>
            {systemData.alerts.map((alert, index) => (
              <li key={index}>{alert.message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;
