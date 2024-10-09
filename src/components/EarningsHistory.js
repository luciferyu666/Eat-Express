// src/components/EarningsHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';

const EarningsHistory = () => {
  const [earnings, setEarnings] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchEarnings = () => {
    if (dateRange.startDate && dateRange.endDate) {
      axios.get('/api/delivery/earnings/history', { params: dateRange })
        .then(response => setEarnings(response.data))
        .catch(error => console.error('Error fetching earnings:', error));
    }
  };

  return (
    <div>
      <h2>歷史收益查詢</h2>
      <label>
        起始日期:
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
        />
      </label>
      <label>
        結束日期:
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
        />
      </label>
      <button onClick={fetchEarnings}>查詢</button>

      {earnings ? (
        <>
          <p>總訂單數：{earnings.totalOrders}</p>
          <p>總收入：${earnings.totalEarnings}</p>
          <CSVLink data={earnings.earningsDetails} filename="earnings.csv">
            導出為 CSV
          </CSVLink>
        </>
      ) : (
        <p>請選擇日期範圍並查詢收益數據。</p>
      )}
    </div>
  );
};

export default EarningsHistory;
