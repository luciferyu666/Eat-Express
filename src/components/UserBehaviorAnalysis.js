// src/components/UserBehaviorAnalysis.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const UserBehaviorAnalysis = () => {
  const [userData, setUserData] = useState([]);

  useEffect(() => {
    // 從後端獲取用戶行為數據
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/reports/user-behavior');
        setUserData(response.data);
      } catch (error) {
        console.error('獲取用戶數據失敗', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="user-behavior-analysis mb-4">
      <h3 className="text-xl font-semibold mb-2">用戶行為分析</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={userData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Bar dataKey="activeUsers" name="活躍用戶" fill="#8884d8" />
          <Bar dataKey="newRegistrations" name="新註冊用戶" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserBehaviorAnalysis;