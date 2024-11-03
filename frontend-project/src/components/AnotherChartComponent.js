import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/AnotherChartComponent.js

import React, { useEffect, useRef } from 'react';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import PropTypes from 'prop-types';

// 註冊 Chart.js 所需的組件
Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnotherChartComponent = ({ data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    let chartInstance;

    if (chartRef.current) {
      // 確保不重複創建 Chart 實例
      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chartRef.current, {
        type: 'bar', // 或其他圖表類型
        data,
        options,
      });
    }

    // 清理函數，銷毀 Chart 實例
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [data, options]);

  return <canvas ref={chartRef}></canvas>;
};

AnotherChartComponent.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
};

export default AnotherChartComponent;
