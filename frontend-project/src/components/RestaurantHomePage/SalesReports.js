import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/RestaurantHomePage/SalesReports.js

import React, { useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// 註冊 Chart.js 所需的組件
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesReports = ({ data }) => {
  useEffect(() => {
    // 可以在這裡進行任何初始化或清理操作
    // 例如，確保圖表在組件卸載時被銷毀
    return () => {
      // 目前使用 react-chartjs-2 已經處理了銷毀，不需手動操作
    };
  }, []);

  if (!data) {
    return <div>加载中...</div>;
  }

  const { dailySales = [], topDishes = [] } = data; // 設置預設值

  const salesData = {
    labels: dailySales.map((item) => item.date),
    datasets: [
      {
        label: '每日銷售額',
        data: dailySales.map((item) => item.total),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const topDishesData = {
    labels: topDishes.map((dish) => dish.name),
    datasets: [
      {
        label: '銷售量',
        data: topDishes.map((dish) => dish.sales),
        backgroundColor: 'rgba(153,102,255,0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '銷售報表',
      },
    },
    scales: {
      x: {
        type: 'category', // 確保 type 是 'category'
        title: {
          display: true,
          text: '日期 / 菜品名稱',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '金額 / 銷售量',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">銷售數據與報表</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">每日銷售額</h3>
        <Bar data={salesData} options={options} />
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">菜品銷售排行</h3>
        <Bar data={topDishesData} options={options} />
      </div>
      {/* 這裡可以添加更多的圖表，如訂單趨勢分析 */}
    </div>
  );
};

SalesReports.propTypes = {
  data: PropTypes.shape({
    dailySales: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        total: PropTypes.number.isRequired,
      })
    ),
    topDishes: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        sales: PropTypes.number.isRequired,
      })
    ),
  }),
};

export default SalesReports;
