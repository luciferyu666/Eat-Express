// DeliveryLocationMonitor.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DeliveryLocationMonitor = () => {
  const [locations, setLocations] = useState([]);  // 存儲外送員的位置
  const [error, setError] = useState(null);  // 存儲錯誤信息（如果有）
  const [loading, setLoading] = useState(true);  // 存儲加載狀態

  // 從伺服器獲取外送員位置的函數
  const fetchLocations = async () => {
    try {
      // 發送 GET 請求來獲取外送員的位置
      const response = await axios.get('http://localhost:5000/api/delivery-persons/locations');
      setLocations(response.data);  // 使用響應數據更新位置狀態
      setError(null);  // 清除任何現有的錯誤信息
    } catch (error) {
      console.error('获取外送员位置失败', error);  // 將錯誤記錄到控制台
      setError('無法獲取外送員位置，請稍後再試');  // 設置用戶友好的錯誤信息
    } finally {
      setLoading(false);  // 設置加載狀態為 false
    }
  };

  // 使用 useEffect 在組件掛載時調用 fetchLocations
  useEffect(() => {
    fetchLocations();
  }, []);  // 空的依賴數組表示這個函數只會在組件首次掛載時運行

  // 根據加載和錯誤狀態渲染不同的內容
  if (loading) {
    return <div>正在加載外送員位置...</div>;  // 顯示加載中的信息
  }

  if (error) {
    return <div className="error">{error}</div>;  // 如果出現錯誤，顯示錯誤信息
  }

  // 渲染外送員位置的列表
  return (
    <div className="delivery-location-monitor">
      <h2>外送員位置列表</h2>
      {locations.length === 0 ? (
        <p>當前沒有可用的外送員位置。</p>  // 如果沒有找到位置，顯示提示信息
      ) : (
        <ul>
          {locations.map((location, index) => (
            <li key={index}>
              經度: {location.location.coordinates[0]}, 緯度: {location.location.coordinates[1]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeliveryLocationMonitor;
