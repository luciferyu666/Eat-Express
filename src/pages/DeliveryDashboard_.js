import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';  // 用於地圖和導航功能

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);  // 存儲待處理訂單
  const [selectedOrder, setSelectedOrder] = useState(null);  // 存儲當前選中的訂單
  const [directions, setDirections] = useState(null);  // 存儲導航路徑

  // 獲取待處理訂單
  useEffect(() => {
    axios.get('/api/delivery/orders')  // 假設存在這個API路由
      .then(response => setOrders(response.data))
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  // 當選擇一個訂單時，更新導航路徑
  useEffect(() => {
    if (selectedOrder) {
      calculateRoute(selectedOrder);
    }
  }, [selectedOrder]);

  // 計算路徑，並使用 Google Maps API 獲取導航指示
  const calculateRoute = (order) => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: order.restaurantAddress,  // 餐廳地址
        destination: order.deliveryAddress,  // 用戶地址
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Error fetching directions: ${result}`);
        }
      }
    );
  };

  // 接受訂單
  const acceptOrder = (orderId) => {
    axios.put(`/api/delivery/orders/${orderId}/accept`)
      .then(() => {
        setSelectedOrder(orders.find(order => order.id === orderId));
      })
      .catch(error => console.error('Error accepting order:', error));
  };

  return (
    <div className="delivery-dashboard">
      <h1>外送員訂單管理</h1>

      {/* 訂單列表展示 */}
      <div className="order-list">
        <h2>待處理訂單</h2>
        {orders.map(order => (
          <div key={order.id} className="order-item">
            <p>餐廳：{order.restaurantName}</p>
            <p>配送地址：{order.deliveryAddress}</p>
            <p>餐品：{order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}</p>
            <p>預估送達時間：{order.estimatedDeliveryTime}</p>
            <button onClick={() => acceptOrder(order.id)}>接受訂單</button>
          </div>
        ))}
      </div>

      {/* 地圖導航展示 */}
      <div className="map-container">
        {selectedOrder && (
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={{ height: '400px', width: '100%' }}
              center={{ lat: selectedOrder.restaurantLat, lng: selectedOrder.restaurantLng }}
              zoom={14}
            >
              {/* 顯示導航路徑 */}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;