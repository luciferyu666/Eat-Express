import { storeAuthToken } from "@utils/tokenStorage";
// DeliveryHome/StatusToggle.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import axiosInstance from '@utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const StatusToggle = () => {
  const { socket, userId } = useDelivery();
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let didCancel = false;

    const fetchStatus = async () => {
      try {
        const response = await axiosInstance.get('/delivery-person/status', {
          // 假设后端可以从认证信息中获取 userId
        });
        if (!didCancel && isMounted.current) {
          setIsOnline(response.data.isOnline);
          setError(null);
        }
      } catch (error) {
        console.error('获取在线状态失败:', error);
        if (!didCancel && isMounted.current) {
          setError('无法获取在线状态，请稍后再试。');
          toast.error('无法获取在线状态，请稍后再试。');
        }
      }
    };

    if (userId) {
      fetchStatus();
    }

    return () => {
      didCancel = true;
    };
  }, [userId]);

  const toggleStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    const newIsOnline = !isOnline;
    try {
      const response = await axiosInstance.post('/delivery-person/status', {
        isOnline: newIsOnline,
      });
      if (isMounted.current) {
        setIsOnline(response.data.isOnline);
        setError(null);

        // 通知后端状态变更
        if (socket && socket.connected) {
          socket.emit('statusChange', {
            userId,
            isOnline: response.data.isOnline,
          });
        } else {
          console.warn('Socket 未连接，无法发送状态变更事件。');
        }

        toast.success(
          `您已成功切换至 ${response.data.isOnline ? '在线' : '离线'} 状态。`
        );
      }
    } catch (error) {
      console.error('切换在线状态失败:', error);
      if (isMounted.current) {
        setError('无法切换在线状态，请稍后再试。');
        toast.error('无法切换在线状态，请稍后再试。');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isOnline, socket, userId]);

  if (!userId) {
    return <p>无法获取用户信息，请重新登录。</p>;
  }

  return (
    <div className="status-toggle flex flex-col items-center">
      <ToastContainer />
      <button
        onClick={toggleStatus}
        className={`px-4 py-2 rounded-lg text-white ${
          isOnline
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-gray-500 hover:bg-gray-600'
        } transition duration-300 ease-in-out flex items-center justify-center`}
        disabled={loading}
        aria-label={`切换至${isOnline ? '离线' : '在线'}状态`}
      >
        {loading ? (
          <FaSpinner className="animate-spin h-5 w-5 mr-3" />
        ) : isOnline ? (
          '在线'
        ) : (
          '离线'
        )}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default StatusToggle;
