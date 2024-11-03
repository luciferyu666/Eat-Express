import { storeAuthToken } from "@utils/tokenStorage";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '@utils/socket'; // 引入 WebSocket 配置
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'; // 用於展示外送員實時位置

const OrderTrackingPage = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState(''); // 訂單狀態
  const [deliveryLocation, setDeliveryLocation] = useState(null); // 外送員位置
  const [orderDetails, setOrderDetails] = useState({}); // 訂單詳細信息

  // 從後端獲取訂單詳情
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(`/orders/${orderId}`);
        setOrderDetails(response.data);
      } catch (error) {
        console.error('Error fetching order details:', error);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // WebSocket 實時更新訂單狀態
  useEffect(() => {
    const handleOrderStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrderStatus(data.status);
        if (data.deliveryLocation) {
          setDeliveryLocation(data.deliveryLocation); // 更新外送員實時位置
        }
      }
    };

    socket.on('orderStatusUpdate', handleOrderStatusUpdate);

    // 清理 WebSocket 連接
    return () => {
      socket.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, [orderId]);

  // 訂單狀態顯示邏輯
  const renderOrderStatus = () => {
    switch (orderStatus) {
      case 'submitted':
        return '訂單已提交';
      case 'confirmed':
        return '餐廳已接單，正在準備中';
      case 'preparing':
        return '餐廳正在準備餐點';
      case 'outForDelivery':
        return '外送員正在配送中';
      case 'completed':
        return '訂單已完成';
      default:
        return '等待訂單更新...';
    }
  };

  return (
    <div className="order-tracking">
      <h1>訂單追蹤</h1>

      {/* 訂單狀態顯示 */}
      <h2>訂單狀態：{renderOrderStatus()}</h2>

      {/* 顯示外送員的實時位置 */}
      {orderStatus === 'outForDelivery' && deliveryLocation && (
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            center={deliveryLocation}
            zoom={15}
            mapContainerStyle={{ height: '400px', width: '100%' }}
          >
            <Marker position={deliveryLocation} title="外送員位置" />
          </GoogleMap>
        </LoadScript>
      )}

      {/* 訂單詳細信息展示 */}
      <div className="order-details">
        <h3>訂單詳情</h3>
        <p>訂單號：{orderDetails.id}</p>
        <p>餐廳：{orderDetails.restaurantName}</p>
        <p>
          菜品：
          {orderDetails.items &&
            orderDetails.items.map((item) => (
              <span key={item.id}>
                {item.name} - {item.quantity}份
              </span>
            ))}
        </p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
