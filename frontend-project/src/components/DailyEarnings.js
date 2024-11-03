import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DailyEarnings.js
import React, { useState, useEffect } from 'react';
import axiosInstance from 'axios';

const DailyEarnings = () => {
  const [earnings, setEarnings] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/delivery/earnings/daily")
      .then((response) => setEarnings(response.data))
      .catch((error) => console.error('Error fetching earnings:', error));
  }, []);

  return (
    <div>
      <h2>每日收益</h2>
      {earnings ? (
        <>
          <p>今日完成訂單數：{earnings.totalOrders}</p>
          <p>今日總收入：${earnings.totalEarnings}</p>
          <ul>
            {earnings.earningsDetails.map((order) => (
              <li key={order.orderId}>
                訂單 {order.orderId} - 收入：${order.total}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>正在加載數據...</p>
      )}
    </div>
  );
};

export default DailyEarnings;
