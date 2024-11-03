import { storeAuthToken } from "@utils/tokenStorage";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const SalesReportPage = () => {
  const [salesData, setSalesData] = useState([]);
  const [timeRange, setTimeRange] = useState('daily'); // 查詢的時間範圍
  const [totalOrders, setTotalOrders] = useState(0); // 訂單總數
  const [totalRevenue, setTotalRevenue] = useState(0); // 總收入
  const [averageOrderValue, setAverageOrderValue] = useState(0); // 平均訂單金額

  // 獲取銷售數據
  useEffect(() => {
    fetchSalesData(timeRange);
  }, [timeRange]);

  const fetchSalesData = async (range) => {
    try {
      const response = await axios.get(`/sales?range=${range}`);
      setSalesData(response.data.sales);
      setTotalOrders(response.data.totalOrders);
      setTotalRevenue(response.data.totalRevenue);
      setAverageOrderValue(response.data.averageOrderValue);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  // 處理時間範圍變更
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <div className="sales-report-page">
      <h1>銷售報表</h1>

      {/* 時間範圍選擇 */}
      <div className="time-range-selector">
        <label>選擇時間範圍：</label>
        <select value={timeRange} onChange={handleTimeRangeChange}>
          <option value="daily">每日</option>
          <option value="weekly">每週</option>
          <option value="monthly">每月</option>
        </select>
      </div>

      {/* 銷售數據展示 */}
      <div className="sales-summary">
        <h2>銷售數據總覽</h2>
        <p>訂單總數：{totalOrders}</p>
        <p>總收入：${totalRevenue.toFixed(2)}</p>
        <p>平均訂單金額：${averageOrderValue.toFixed(2)}</p>
      </div>

      {/* 銷售詳細數據表 */}
      <table className="sales-table">
        <thead>
          <tr>
            <th>菜品名稱</th>
            <th>銷量</th>
            <th>總收入</th>
          </tr>
        </thead>
        <tbody>
          {salesData.map((dish) => (
            <tr key={dish.dishId}>
              <td>{dish.name}</td>
              <td>{dish.quantity}</td>
              <td>${dish.totalRevenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 導出為 CSV */}
      <div className="export-csv">
        <CSVLink data={salesData} filename={`sales_report_${timeRange}.csv`}>
          導出為 CSV
        </CSVLink>
      </div>
    </div>
  );
};

export default SalesReportPage;
