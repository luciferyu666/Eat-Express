import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/ChartComponent.js

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// 註冊所有組件
Chart.register(...registerables);

const ChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // 如果已經存在 Chart 實例，先銷毀它
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // 創建新的 Chart 實例
      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'bar', // 或其他圖表類型
        data,
        options,
      });
    }

    // 清理函數，銷毀 Chart 實例
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={chartRef}></canvas>;
};

export default ChartComponent;
