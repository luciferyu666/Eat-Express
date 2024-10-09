// src/components/OrderTracking.js
import React, { useEffect, useState } from 'react';
import socket from '../socket';  // 假設已經配置好 WebSocket 連接

const OrderTracking = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState('');

  useEffect(() => {
    socket.emit('joinOrderRoom', { orderId });

    socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status);
      }
    });

    return () => {
      socket.off('orderStatusUpdate');
    };
  }, [orderId]);

  return (
    <div className="order-tracking">
      <h1>訂單追蹤</h1>
      <p>當前訂單狀態: {orderStatus}</p>
    </div>
  );
};

export default OrderTracking;