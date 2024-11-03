import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DeliveryHome/OrderStatusUpdater.js

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import axiosInstance from '@utils/axiosInstance';
import { Modal } from 'antd'; // 使用 Ant Design 的模态对话框
import PropTypes from 'prop-types';

const OrderStatusUpdater = () => {
  const { currentOrders = [], setCurrentOrders, socket } = useDelivery();
  const [updatingOrderIds, setUpdatingOrderIds] = useState([]);
  const [orderMessages, setOrderMessages] = useState({});

  // 使用 useRef 持久化 isMounted 状态
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      setOrderMessages((prev) => ({
        ...prev,
        [orderId]: { loading: true, error: null, success: null },
      }));
      setUpdatingOrderIds((prev) => [...prev, orderId]);

      try {
        const response = await axiosInstance.patch(
          `/orders/${orderId}/status`,
          {
            status: newStatus,
          }
        );
        const updatedOrder = response.data.order;

        // 更新状态到上下文
        setCurrentOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );

        // 发送 Socket.IO 事件
        if (socket && socket.connected) {
          socket.emit('orderStatusUpdate', { orderId, status: newStatus });
        }

        if (isMounted.current) {
          setOrderMessages((prev) => ({
            ...prev,
            [orderId]: {
              success: `订单 ${orderId} 状态已更新为 "${newStatus}"。`,
            },
          }));
        }
      } catch (error) {
        console.error('更新订单状态失败:', error);
        const errorMessage =
          error.response?.data?.message ||
          `无法更新订单 ${orderId} 状态，请稍后再试。`;
        if (isMounted.current) {
          setOrderMessages((prev) => ({
            ...prev,
            [orderId]: { error: errorMessage },
          }));
        }
      } finally {
        if (isMounted.current) {
          setUpdatingOrderIds((prev) => prev.filter((id) => id !== orderId));
        }
      }
    },
    [socket, setCurrentOrders]
  );

  const confirmUpdate = (orderId, newStatus) => {
    return new Promise((resolve) => {
      Modal.confirm({
        title: '确认更新',
        content: `确定要将订单 ${orderId} 的状态更新为 "${newStatus}" 吗？`,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">更新订单状态</h2>

      {currentOrders.length === 0 ? (
        <p className="text-gray-500">目前没有订单需要更新。</p>
      ) : (
        <ul>
          {currentOrders.map((order) => (
            <li key={order._id} className="border-b py-2">
              <div className="flex items-center justify-between">
                <div>
                  <p>
                    <strong>订单ID：</strong> {order._id}
                  </p>
                  <p>
                    <strong>状态：</strong> {order.status}
                  </p>
                  {/* 显示订单的成功或错误消息 */}
                  {orderMessages[order._id]?.success && (
                    <p className="text-green-500">
                      {orderMessages[order._id].success}
                    </p>
                  )}
                  {orderMessages[order._id]?.error && (
                    <p className="text-red-500">
                      {orderMessages[order._id].error}
                    </p>
                  )}
                </div>
                <div>
                  <select
                    value={order.status}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      const confirmed = await confirmUpdate(
                        order._id,
                        newStatus
                      );
                      if (confirmed) {
                        updateOrderStatus(order._id, newStatus);
                      }
                    }}
                    disabled={updatingOrderIds.includes(order._id)}
                    className={`mt-2 p-2 border rounded ${
                      updatingOrderIds.includes(order._id)
                        ? 'bg-gray-200'
                        : 'bg-white'
                    }`}
                  >
                    <option value="assigned">已分配</option>
                    <option value="preparing">制作中</option>
                    <option value="delivering">配送中</option>
                    <option value="completed">已完成</option>
                    <option value="cancelled">已取消</option>
                  </select>
                  {updatingOrderIds.includes(order._id) && (
                    <span className="ml-2 text-sm text-gray-500">
                      更新中...
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

OrderStatusUpdater.propTypes = {
  // 如果有 props，请在此定义
};

export default OrderStatusUpdater;
