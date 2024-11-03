import { storeAuthToken } from "@utils/tokenStorage";
import React, { useState, useEffect } from 'react';
import axiosInstance from 'axios';
import socket from '@utils/socket'; // 引入 WebSocket 配置

const DeliveryOrderStatus = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState('preparing'); // 初始狀態設置為「準備中」
  const [deliveryLocation, setDeliveryLocation] = useState(null); // 存儲外送員的實時位置

  // 獲取訂單詳情
  useEffect(() => {
    axiosInstance
      .get(`/orders/${orderId}`)
      .then((response) => setOrderStatus(response.data.status))
      .catch((error) => console.error('Error fetching order details:', error));
  }, [orderId]);

  // 更新訂單狀態
  const updateOrderStatus = (newStatus) => {
    axiosInstance
      .put(`/orders/${orderId}/status`, { status: newStatus })
      .then((response) => {
        setOrderStatus(newStatus);
        // 通知 WebSocket 更新狀態
        socket.emit('orderStatusUpdate', { orderId, status: newStatus });
      })
      .catch((error) => console.error('Error updating order status:', error));
  };

  // 實時追蹤外送員位置 (假設已集成位置服務)
  useEffect(() => {
    if (orderStatus === 'outForDelivery') {
      const watchId = navigator.geolocation.watchPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDeliveryLocation(location);

        // 通知後端更新位置
        socket.emit('deliveryLocationUpdate', { orderId, location });
      });

      // 停止位置追蹤
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [orderStatus, orderId]);

  return (
    <div className="delivery-order-status">
      <h1>訂單狀態管理</h1>
      <h2>當前狀態：{orderStatus}</h2>

      {/* 取餐狀態更新按鈕 */}
      {orderStatus === 'preparing' && (
        <button onClick={() => updateOrderStatus('pickedUp')}>已取餐</button>
      )}

      {/* 配送中狀態更新按鈕 */}
      {orderStatus === 'pickedUp' && (
        <button onClick={() => updateOrderStatus('outForDelivery')}>
          開始配送
        </button>
      )}

      {/* 送達狀態更新按鈕 */}
      {orderStatus === 'outForDelivery' && (
        <button onClick={() => updateOrderStatus('delivered')}>完成配送</button>
      )}

      {/* 顯示外送員的實時位置 */}
      {deliveryLocation && (
        <div>
          <h3>外送員位置：</h3>
          <p>
            緯度: {deliveryLocation.lat}, 經度: {deliveryLocation.lng}
          </p>
        </div>
      )}

      {/* 聯繫用戶 */}
      <button onClick={() => window.open(`tel:${order.customerPhone}`)}>
        聯繫用戶
      </button>
    </div>
  );
};

export default DeliveryOrderStatus;
