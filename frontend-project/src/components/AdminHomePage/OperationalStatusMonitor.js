// frontend-project/src/components/AdminHomePage/OperationalStatusMonitor.js

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const OperationalStatusMonitor = () => {
  const [restaurantStatus, setRestaurantStatus] = useState([]);
  const [activeDeliveryPersons, setActiveDeliveryPersons] = useState(0);
  const [userActivity, setUserActivity] = useState(0);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    try {
      const [restaurants, deliveryPersons, users, systemAlerts] = await Promise.all([
        api.get('/restaurants/status'),
        api.get('/deliveryPersons/activeCount'),
        api.get('/users/activityCount'),
        api.get('/alerts')
      ]);

      setRestaurantStatus(restaurants.data);
      setActiveDeliveryPersons(deliveryPersons.data.count);
      setUserActivity(users.data.count);
      setAlerts(systemAlerts.data);
    } catch (error) {
      console.error('獲取運營狀況失敗:', error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">運營狀況監控</h3>
      
      {/* 餐廳營業情況 */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold">餐廳營業情況</h4>
        <ul className="list-disc list-inside">
          {restaurantStatus.map(restaurant => (
            <li key={restaurant.id}>
              {restaurant.name} - {restaurant.status}
            </li>
          ))}
        </ul>
      </div>

      {/* 活躍外送員數量 */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold">活躍外送員數量</h4>
        <p>{activeDeliveryPersons}</p>
      </div>

      {/* 用戶活動數據 */}
      <div className="mb-4">
        <h4 className="text-lg font-semibold">用戶活動數據</h4>
        <p>{userActivity} 活躍用戶</p>
      </div>

      {/* 系統告警 */}
      <div>
        <h4 className="text-lg font-semibold">系統告警</h4>
        {alerts.length > 0 ? (
          <ul className="list-disc list-inside text-red-600">
            {alerts.map(alert => (
              <li key={alert.id}>{alert.message}</li>
            ))}
          </ul>
        ) : (
          <p>目前沒有告警。</p>
        )}
      </div>
    </div>
  );
};

export default OperationalStatusMonitor;
