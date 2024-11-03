import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DeliveryHome/Notifications.js

import React, { useEffect, useState, useCallback } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import axiosInstance from '@utils/axiosInstance';

const Notifications = () => {
  const { notifications = [], setNotifications, userId } = useDelivery();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/notifications/history', {
        params: { recipient: userId },
      });
      setNotifications(response.data.data || []);
      setError(null); // 重置错误状态
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '无法获取通知，请稍后再试。';
      console.error('获取通知失败:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, setNotifications]);

  useEffect(() => {
    let isMounted = true;

    if (userId) {
      fetchNotifications();
    }

    return () => {
      isMounted = false;
    };
  }, [fetchNotifications, userId]);

  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      setError(null);
      setSuccess(null);
      try {
        await axiosInstance.delete(`/notifications/${notificationId}`);
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification._id !== notificationId
          )
        );
        setSuccess('通知已成功删除。');
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || '无法删除通知，请稍后再试。';
        console.error('删除通知失败:', errorMessage);
        setError(errorMessage);
      }
    },
    [setNotifications]
  );

  const handleClearAllNotifications = useCallback(async () => {
    setError(null);
    setSuccess(null);
    try {
      await axiosInstance.delete('/notifications/clear', {
        params: { recipient: userId },
      });
      setNotifications([]);
      setSuccess('所有通知已成功清除。');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || '无法清除通知，请稍后再试。';
      console.error('清除通知失败:', errorMessage);
      setError(errorMessage);
    }
  }, [setNotifications, userId]);

  return (
    <div className="notifications">
      <h2>通知</h2>

      {/* 显示错误信息 */}
      {error && <p className="error-message">{error}</p>}

      {/* 显示成功信息 */}
      {success && <p className="success-message">{success}</p>}

      {/* 显示加载指示器 */}
      {loading && <p>正在加载通知...</p>}

      {/* 显示通知列表 */}
      {!loading && notifications.length > 0 ? (
        <>
          <button
            onClick={handleClearAllNotifications}
            className="clear-all-button"
          >
            清除所有通知
          </button>
          <ul>
            {notifications.map((notification) => (
              <li key={notification._id} className="notification-item">
                <span>{notification.message}</span>
                {/* 可选：添加删除按钮 */}
                <button
                  onClick={() => handleDeleteNotification(notification._id)}
                  className="delete-button"
                  aria-label={`删除通知 ${notification._id}`}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        !loading && <p>目前没有新通知。</p>
      )}
    </div>
  );
};

export default Notifications;
