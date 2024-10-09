// src/components/OperationalStatusMonitor.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const OperationalStatusMonitor = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // 獲取餐廳、外送員和用戶的活動數據
    const fetchOperationalData = async () => {
      try {
        const [restaurantsRes, deliveryPersonsRes, usersRes] = await Promise.all([
          axios.get('/api/restaurants/active'),
          axios.get('/api/delivery-persons/active'),
          axios.get('/api/users/active'),
        ]);
        setRestaurants(restaurantsRes.data);
        setDeliveryPersons(deliveryPersonsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error('獲取運營數據失敗', error);
      }
    };

    fetchOperationalData();
  }, []);

  return (
    <div className="operational-status-monitor mb-4">
      <h3 className="text-xl font-semibold mb-2">運營狀況監控</h3>
      {/* 運營數據展示 */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-100 rounded">
          <h4 className="text-lg font-semibold">活躍餐廳</h4>
          <p className="text-2xl">{restaurants.length}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h4 className="text-lg font-semibold">活躍外送員</h4>
          <p className="text-2xl">{deliveryPersons.length}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded">
          <h4 className="text-lg font-semibold">活躍用戶</h4>
          <p className="text-2xl">{users.length}</p>
        </div>
      </div>
    </div>
  );
};

export default OperationalStatusMonitor;