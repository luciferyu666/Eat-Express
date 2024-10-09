// src/components/RestaurantHomePage/SalesReports.js

import React from 'react';
import { Bar } from 'react-chartjs-2';

const SalesReports = ({ data }) => {
  const { dailySales, topDishes } = data; // 只使用 dailySales 和 topDishes

  const salesData = {
    labels: dailySales.map(item => item.date),
    datasets: [
      {
        label: '每日銷售額',
        data: dailySales.map(item => item.total),
        backgroundColor: 'rgba(75,192,192,0.6)',
      },
    ],
  };

  const topDishesData = {
    labels: topDishes.map(dish => dish.name),
    datasets: [
      {
        label: '銷售量',
        data: topDishes.map(dish => dish.sales),
        backgroundColor: 'rgba(153,102,255,0.6)',
      },
    ],
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">銷售數據與報表</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">每日銷售額</h3>
        <Bar data={salesData} />
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">菜品銷售排行</h3>
        <Bar data={topDishesData} />
      </div>
      {/* 這裡可以添加更多的圖表，如訂單趨勢分析 */}
    </div>
  );
};

export default SalesReports;
