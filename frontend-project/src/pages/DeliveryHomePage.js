// src/pages/DeliveryHomePage.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import LogoutButton from '../components/LogoutButton';
import NewOrders from '../components/NewOrders';
import CurrentOrders from '../components/CurrentOrders';
import OrderStatusUpdater from '../components/OrderStatusUpdater';
import Earnings from '../components/Earnings';
import OrderHistory from '../components/OrderHistory';
import StatusToggle from '../components/StatusToggle';
import Support from '../components/Support';
import Profile from '../components/Profile';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { connectSocket, disconnectSocket, getSocket } from '../socket'; // 引入 socket 工具

const center = {
  lat: 25.0330, // 台北 101 的座標
  lng: 121.5654,
};

// 環境變量存儲 API Key
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const DeliveryHomePage = () => {
  const [newOrders, setNewOrders] = useState([]); // 實時接收的新訂單
  const [currentOrders, setCurrentOrders] = useState([]); // 當前待處理訂單
  const [earnings, setEarnings] = useState({ daily: 0, weekly: 0 }); // 收益數據
  const [status, setStatus] = useState('在線'); // 外送員的在線/離線狀態
  const [historyOrders, setHistoryOrders] = useState([]); // 歷史訂單
  const [directionsResponse, setDirectionsResponse] = useState(null); // Google Maps 路線回應
  const [deliveryLocation, setDeliveryLocation] = useState(null); // 客戶位置
  const [driverLocation, setDriverLocation] = useState(null); // 外送員當前位置
  const [navigationDetails, setNavigationDetails] = useState(null); // 導航詳細資訊

  // 使用 useLoadScript Hook 加載 Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
  });

  // 模擬數據（在實際開發中應從後端獲取）
  const mockNewOrders = [
    {
      id: 'ORD1001',
      restaurantAddress: '台北市信義路五段7號',
      customerAddress: '台北市松山區敦化北路201號',
      items: [{ name: '雞腿便當' }, { name: '滷肉飯' }],
    },
    // ...其他模擬訂單
  ];

  const mockCurrentOrders = [
    {
      id: 'ORD1002',
      customerAddress: '台北市大安區和平東路100號',
    },
    // ...其他模擬訂單
  ];

  const mockHistoryOrders = [
    {
      id: 'ORD0999',
      deliveryDate: '2023-09-01',
      earnings: 150,
    },
    // ...其他模擬歷史訂單
  ];

  const mockEarnings = {
    daily: 800,
    weekly: 4500,
  };

  // 獲取外送員當前位置
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting driver location:', error);
          // 使用默認位置
          setDriverLocation(center);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // 使用默認位置
      setDriverLocation(center);
    }
  }, []);

  // 初始化 Socket 連接
  useEffect(() => {
    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  // 訂單更新處理
  useEffect(() => {
    const socket = getSocket(); // 獲取當前 Socket 實例

    if (socket) {
      socket.on('newDeliveryOrder', (order) => {
        setNewOrders((prevOrders) => [...prevOrders, order]);
      });

      // 使用模擬數據（可刪除，僅供測試）
      setNewOrders(mockNewOrders);

      return () => {
        socket.off('newDeliveryOrder');
      };
    } else {
      console.warn('Socket 尚未連接，無法接收新訂單');
    }
  }, [mockNewOrders]);

  // 獲取初始數據，僅在 Google Maps API 加載完成後執行
  useEffect(() => {
    if (!isLoaded) return; // 確保 API 已加載

    const fetchCurrentOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/delivery/orders/current');
        setCurrentOrders(data);

        // 設置導航的客戶地址
        if (data.length > 0) {
          const { customerAddress } = data[0];
          // 使用地理編碼將地址轉換為經緯度
          geocodeAddress(customerAddress);
        } else {
          // 如果沒有當前訂單，設置為 null
          setDeliveryLocation(null);
        }
      } catch (error) {
        console.error('Error fetching current orders:', error);
        // 使用模擬數據
        setCurrentOrders(mockCurrentOrders);

        // 設置導航的客戶地址（模擬數據）
        if (mockCurrentOrders.length > 0) {
          const { customerAddress } = mockCurrentOrders[0];
          geocodeAddress(customerAddress);
        } else {
          setDeliveryLocation(null);
        }
      }
    };

    const fetchEarnings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/delivery/earnings');
        setEarnings(data);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        // 使用模擬數據
        setEarnings(mockEarnings);
      }
    };

    const fetchHistoryOrders = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/delivery/orders/history');
        setHistoryOrders(data);
      } catch (error) {
        console.error('Error fetching history orders:', error);
        // 使用模擬數據
        setHistoryOrders(mockHistoryOrders);
      }
    };

    fetchCurrentOrders();
    fetchEarnings();
    fetchHistoryOrders();
  }, [isLoaded, geocodeAddress, mockCurrentOrders, mockEarnings, mockHistoryOrders]);

  // 地理編碼函數，將地址轉換為經緯度
  const geocodeAddress = useCallback(
    (address) => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API 尚未加載');
        return;
      }

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setDeliveryLocation({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
          });
        } else {
          console.error(
            'Geocode was not successful for the following reason:',
            status
          );
          // 使用默認位置
          setDeliveryLocation(center);
        }
      });
    },
    [] // 將 center 移到外部，避免依賴
  );

  // 更新訂單狀態，並規劃路徑
  const handleAcceptOrder = (orderId, customerAddress) => {
    updateOrderStatus(orderId, '取餐完成');
    // 規劃路線
    geocodeAddress(customerAddress);
    calculateRoute();
  };

  // 規劃路線
  const calculateRoute = useCallback(() => {
    if (driverLocation && deliveryLocation) {
      setDirectionsResponse(null); // 清除之前的路線
      // 這裡您可以集成 DirectionsService 或其他路線規劃邏輯
    } else {
      console.error('Driver or delivery location is missing.');
    }
  }, [driverLocation, deliveryLocation]);

  // 更新訂單狀態
  const updateOrderStatus = (orderId, newStatus) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('updateOrderStatus', { orderId, status: newStatus });
      // 更新本地訂單狀態（可選）
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      console.warn('Socket 尚未連接，無法更新訂單狀態');
    }
  };

  // 切換外送員狀態
  const toggleStatus = () => {
    const newStatus = status === '在線' ? '離線' : '在線';
    setStatus(newStatus);
    // 發送狀態變更到後端
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.emit('updateDriverStatus', { status: newStatus });
    } else {
      console.warn('Socket 尚未連接，無法更新狀態');
    }
  };

  // Google Maps Directions API 回應處理
  const handleDirectionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirectionsResponse(response);

        // 提取導航詳細資訊
        const route = response.routes[0];
        const legs = route.legs[0];
        setNavigationDetails({
          distance: legs.distance.text,
          duration: legs.duration.text,
          steps: legs.steps.map((step) => ({
            instructions: step.instructions,
            distance: step.distance.text,
            duration: step.duration.text,
          })),
        });
      } else {
        console.error('Directions request failed:', response);
      }
    }
  };

  if (loadError) {
    console.error('Error loading Google Maps API:', loadError);
    return <div>地圖加載失敗，請稍後重試。</div>;
  }

  // 在 API 加載完成前，顯示加載狀態
  if (!isLoaded) {
    return <div>正在加載地圖...</div>;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-900 text-center">
        外送員管理後台
      </h1>

      {/* 登出按鈕 */}
      <LogoutButton />

      {/* 在線/離線狀態切換 */}
      <StatusToggle status={status} onToggleStatus={toggleStatus} />

      {/* 新訂單提醒 */}
      <NewOrders newOrders={newOrders} onAcceptOrder={handleAcceptOrder} />

      {/* 當前待處理訂單 */}
      <CurrentOrders currentOrders={currentOrders} onUpdateStatus={updateOrderStatus} />

      {/* 收益數據概覽 */}
      <Earnings earnings={earnings} />

      {/* 歷史訂單 */}
      <OrderHistory historyOrders={historyOrders} />

      {/* 導航與路徑規劃 */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '400px' }}
        center={driverLocation || center}
        zoom={12}
        onLoad={(map) => {
          console.log('Google Map 已加載:', map);
        }}
        onUnmount={(map) => {
          console.log('Google Map 已卸載:', map);
        }}
      >
        {deliveryLocation && (
          <>
            <Marker position={driverLocation} label="您" />
            <Marker position={deliveryLocation} label="客戶" />
            {/* 您可以在此集成 DirectionsService 和 DirectionsRenderer 來顯示路線 */}
          </>
        )}
      </GoogleMap>

      {/* 導航詳細資訊 */}
      {navigationDetails && (
        <OrderStatusUpdater navigationDetails={navigationDetails} />
      )}

      {/* 支持與幫助 */}
      <Support />

      {/* 外送員個人資料 */}
      <Profile />
    </div>
  );
};

export default DeliveryHomePage;
