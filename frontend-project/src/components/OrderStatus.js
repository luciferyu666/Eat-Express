// src/components/OrderStatus.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 創建 WebSocket 連接，確保指向正確的後端 URL
const socket = io('http://localhost:5000', {
  transports: ['websocket'], // 使用 WebSocket 進行連接
});

const OrderStatus = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState('等待訂單狀態更新...');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 檢查 JWT Token 是否存在，並且附加到 API 請求
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login'); // 若無 JWT Token，跳轉至登入頁面
      return;
    }

    // 發送訂單狀態的 API 請求，並附加 JWT Token
    axios
      .get(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // 使用 JWT Token 授權
        },
      })
      .then((response) => {
        setOrderStatus(`當前訂單狀態: ${response.data.status}`);
        if (response.data.deliveryLocation) {
          setDeliveryLocation(response.data.deliveryLocation);
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 401) {
          // 如果 JWT 無效或過期，跳轉至登入頁面
          navigate('/login');
        } else {
          console.error('無法獲取訂單狀態:', error);
        }
      });

    // 訂閱 WebSocket 訂單狀態更新
    socket.emit('joinOrderRoom', { orderId });

    socket.on('orderStatusUpdate', (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(`訂單狀態已更新為: ${data.status}`);
        if (data.deliveryLocation) {
          setDeliveryLocation(data.deliveryLocation);
        }
      }
    });

    // 組件卸載時，離開訂單的 WebSocket 房間
    return () => {
      socket.emit('leaveOrderRoom', { orderId });
      socket.off('orderStatusUpdate'); // 取消訂閱狀態更新事件
    };
  }, [orderId, navigate]);

  return (
    <div>
      <h2>訂單狀態</h2>
      <p>{orderStatus}</p>
      {deliveryLocation && (
        <p>外送員的當前位置: 經度 {deliveryLocation.coordinates[0]}, 緯度 {deliveryLocation.coordinates[1]}</p>
      )}
    </div>
  );
};

export default OrderStatus;
