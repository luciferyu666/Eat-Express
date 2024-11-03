import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/RestaurantHomePage/BusinessStatus.js

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@services/axiosConfig'; // 使用正確的 axios 實例
import { toast } from 'react-toastify'; // 引入 react-toastify 用於通知
import PropTypes from 'prop-types'; // 引入 PropTypes 進行類型檢查

/**
 * BusinessStatus 组件用于管理餐厅的营业状态和营业时间。
 * @param {Object} props - 组件属性
 * @param {string} props.status - 当前营业状态
 * @param {Function} props.setStatus - 更新营业状态的函数
 * @returns {JSX.Element} 返回 BusinessStatus 组件
 */
const BusinessStatus = ({ status, setStatus }) => {
  // 状态管理
  const [businessHours, setBusinessHours] = useState({
    open: '',
    close: '',
  });

  const [loading, setLoading] = useState(false); // 保存营业时间时的加载状态

  // 获取当前营业时间
  useEffect(() => {
    const fetchBusinessHours = async () => {
      try {
        const response = await axiosInstance.get('/restaurants/business-hours');
        setBusinessHours(response.data);
        console.log('获取营业时间成功:', response.data); // 調試日誌，可移除
      } catch (error) {
        console.error('获取营业时间失败:', error);
        toast.error('获取营业时间失败，请稍后再试。');
      }
    };

    fetchBusinessHours();
  }, []);

  /**
   * 处理营业状态的变更
   * @param {string} newStatus - 新的营业状态
   */
  const handleStatusChange = useCallback(
    async (newStatus) => {
      try {
        await axiosInstance.post('/restaurants/business-status', {
          status: newStatus,
        });
        setStatus(newStatus);
        toast.success('营业状态更新成功。');
        console.log(`状态从 ${status} 变更为 ${newStatus}`); // 調試日誌，可移除
      } catch (error) {
        console.error('更新营业状态失败:', error);
        toast.error('更新营业状态失败，请稍后再试。');
      }
    },
    [setStatus, status]
  );

  /**
   * 处理营业时间输入的变化
   * @param {Object} e - 事件对象
   */
  const handleHoursChange = (e) => {
    const { name, value } = e.target;
    setBusinessHours((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * 保存营业时间
   */
  const saveBusinessHours = useCallback(async () => {
    // 验证营业时间
    if (businessHours.open >= businessHours.close) {
      toast.error('开放时间必须早于关闭时间。');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/restaurants/business-hours', businessHours);
      toast.success('营业时间更新成功。');
      console.log('保存营业时间:', businessHours); // 調試日誌，可移除
    } catch (error) {
      console.error('更新营业时间失败:', error);
      toast.error('更新营业时间失败，请稍后再试。');
    } finally {
      setLoading(false);
    }
  }, [businessHours]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">营业状态管理</h2>
      <p>
        当前状态: <strong>{status}</strong>
      </p>{' '}
      {/* 显示当前状态 */}
      <div className="flex items-center space-x-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${
            status === 'Open' ? 'bg-green-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleStatusChange('Open')}
        >
          营业中
        </button>
        <button
          className={`px-4 py-2 rounded ${
            status === 'Paused' ? 'bg-yellow-500 text-white' : 'bg-gray-200'
          }`}
          onClick={() => handleStatusChange('Paused')}
        >
          暂停接单
        </button>
        <button
          className={`px-4 py-2 rounded ${
            status === 'Closing Soon' ? 'bg-red-500 text-white' : 'bg-gray-200'
          }`}
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
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={saveBusinessHours}
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </button>
      </div>
    </div>
  );
};

// PropTypes 定义
BusinessStatus.propTypes = {
  status: PropTypes.string.isRequired,
  setStatus: PropTypes.func.isRequired,
};

export default BusinessStatus;
