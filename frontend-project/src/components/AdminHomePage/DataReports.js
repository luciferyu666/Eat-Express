import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/AdminHomePage/DataReports.js

import React, { useEffect, useState } from 'react';
import api from '@utils/api';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { saveAs } from 'file-saver';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const DataReports = () => {
  const [systemReport, setSystemReport] = useState({});
  const [userBehavior, setUserBehavior] = useState({});
  const [restaurantPerformance, setRestaurantPerformance] = useState({});
  const [selectedReport, setSelectedReport] = useState('system');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [systemRes, userRes, restaurantRes] = await Promise.all([
        api.get('/reports/system'),
        api.get('/reports/userBehavior'),
        api.get('/reports/restaurantPerformance'),
      ]);

      setSystemReport(systemRes.data);
      setUserBehavior(userRes.data);
      setRestaurantPerformance(restaurantRes.data);
    } catch (error) {
      console.error('獲取報表失敗:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/reports/export/${selectedReport}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, `${selectedReport}_report.pdf`);
    } catch (error) {
      console.error('導出報表失敗:', error);
    }
  };

  const renderChart = () => {
    switch (selectedReport) {
      case 'system':
        return (
          <Bar
            data={{
              labels: systemReport.labels,
              datasets: [
                {
                  label: '總訂單量',
                  data: systemReport.orderCounts,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
                {
                  label: '總收入',
                  data: systemReport.revenues,
                  backgroundColor: 'rgba(153, 102, 255, 0.6)',
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        );
      case 'user':
        return (
          <Line
            data={{
              labels: userBehavior.labels,
              datasets: [
                {
                  label: '活躍用戶數',
                  data: userBehavior.activeUsers,
                  fill: false,
                  borderColor: 'rgba(255, 99, 132, 0.6)',
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        );
      case 'restaurant':
        return (
          <Pie
            data={{
              labels: restaurantPerformance.labels,
              datasets: [
                {
                  label: '餐廳表現',
                  data: restaurantPerformance.performanceData,
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                  ],
                },
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">數據報表與分析</h3>

      {/* 報表選擇 */}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setSelectedReport('system')}
          className={`px-4 py-2 rounded ${
            selectedReport === 'system'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          系統運營報表
        </button>
        <button
          onClick={() => setSelectedReport('user')}
          className={`px-4 py-2 rounded ${
            selectedReport === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
          }`}
        >
          用戶行為分析
        </button>
        <button
          onClick={() => setSelectedReport('restaurant')}
          className={`px-4 py-2 rounded ${
            selectedReport === 'restaurant'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200'
          }`}
        >
          餐廳表現分析
        </button>
      </div>

      {/* 報表內容 */}
      <div className="w-full h-64">{renderChart()}</div>

      {/* 導出報表按鈕 */}
      <button
        onClick={handleExport}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
      >
        導出為 PDF
      </button>
    </div>
  );
};

export default DataReports;
