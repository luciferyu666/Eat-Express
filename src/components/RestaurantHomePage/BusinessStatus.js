// src/components/RestaurantHomePage/BusinessStatus.js

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const BusinessStatus = ({ status, setStatus }) => {
  console.log('BusinessStatus 组件已渲染，当前状态:', status); // 調試日誌

  const [businessHours, setBusinessHours] = useState({
    open: '',
    close: '',
  });

  useEffect(() => {
    // 获取当前营业时间
    api.get('/restaurants/business-hours')
      .then(response => {
        console.log('获取营业时间成功:', response.data); // 調試日誌
        setBusinessHours(response.data);
      })
      .catch(error => console.error('获取营业时间失败:', error));
  }, []);

  const handleStatusChange = (newStatus) => {
    console.log(`状态从 ${status} 变更为 ${newStatus}`); // 調試日誌
    setStatus(newStatus);
    api.post('/restaurants/business-status', { status: newStatus })
      .then(response => console.log('营业状态更新成功'))
      .catch(error => console.error('更新营业状态失败:', error));
  };

  const handleHoursChange = (e) => {
    const { name, value } = e.target;
    setBusinessHours(prev => ({ ...prev, [name]: value }));
  };

  const saveBusinessHours = () => {
    console.log('保存营业时间:', businessHours); // 調試日誌
    api.post('/restaurants/business-hours', businessHours)
      .then(response => console.log('营业时间更新成功'))
      .catch(error => console.error('更新营业时间失败:', error));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">营业状态管理</h2>
      <p>当前状态: {status}</p> {/* 显示当前状态 */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${status === 'Open' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleStatusChange('Open')}
        >
          营业中
        </button>
        <button
          className={`px-4 py-2 rounded ${status === 'Paused' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleStatusChange('Paused')}
        >
          暂停接单
        </button>
        <button
          className={`px-4 py-2 rounded ${status === 'Closing Soon' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
          onClick={() => handleStatusChange('Closing Soon')}
        >
          即将打烊
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-gray-700">开放时间：</label>
          <input
            type="time"
            name="open"
            value={businessHours.open}
            onChange={handleHoursChange}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-gray-700">关闭时间：</label>
          <input
            type="time"
            name="close"
            value={businessHours.close}
            onChange={handleHoursChange}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={saveBusinessHours}
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default BusinessStatus;
