// src/components/SystemOperationReports.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SystemOperationReports = () => {
  const [reportData, setReportData] = useState([]);

  useEffect(() => {
    // 從後端獲取報表數據
    const fetchReportData = async () => {
      try {
        const response = await axios.get('/api/reports/system-operation');
        setReportData(response.data);
      } catch (error) {
        console.error('獲取報表數據失敗', error);
      }
    };

    fetchReportData();
  }, []);

  return (
    <div className="system-operation-reports mb-4">
      <h3 className="text-xl font-semibold mb-2">系統運營報表</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={reportData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="date" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="totalOrders" name="總訂單量" stroke="#8884d8" />
          <Line type="monotone" dataKey="totalRevenue" name="總收入" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemOperationReports;