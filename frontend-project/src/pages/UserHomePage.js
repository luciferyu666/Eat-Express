// src/pages/UserHomePage.js

import React, { useEffect, useState } from 'react';
import NearbyRestaurants from '../components/UserHomePage/NearbyRestaurants';
import PopularDishes from '../components/UserHomePage/PopularDishes';
import PersonalizedRecommendations from '../components/UserHomePage/PersonalizedRecommendations';
import SearchBar from '../components/UserHomePage/SearchBar';
import MenuBrowser from '../components/UserHomePage/MenuBrowser';
import ShoppingCart from '../components/UserHomePage/ShoppingCart';
import OrderTracking from '../components/UserHomePage/OrderTracking';
import PaymentPage from '../components/UserHomePage/PaymentPage';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../socket';
import api from '../utils/api'; // 確保導入為 api
import { useNavigate } from 'react-router-dom'; // 新增導入
import LogoutButton from '../components/LogoutButton'; // 引入 LogoutButton

const UserHomePage = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cartItems, setCartItems] = useState([]); // 添加購物車狀態
  const [locationError, setLocationError] = useState(''); // 添加錯誤狀態
  const navigate = useNavigate(); // 使用 useNavigate 鉤子

  const addToCart = (dish) => {
    setCartItems((prevItems) => [...prevItems, { dish, quantity: 1, notes: '' }]); // 更新購物車
    console.log('已加入購物車:', dish);
  };

  useEffect(() => {
    // 獲取用戶地理位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log('用戶位置:', location); // 日誌
          setUserLocation(location);
        },
        (error) => {
          console.error('無法獲取用戶位置:', error);
          setLocationError(error.message || '無法獲取用戶位置');
        }
      );
    } else {
      const errorMsg = '瀏覽器不支持地理位置獲取';
      console.error(errorMsg);
      setLocationError(errorMsg);
    }

    // 獲取 Socket 實例
    const socket = getSocket();

    if (socket) {
      // 監聽訂單狀態更新
      socket.on('orderStatusUpdate', (data) => {
        if (selectedOrder && data.orderId === selectedOrder.id) {
          setSelectedOrder((prevOrder) => ({
            ...prevOrder,
            status: data.status,
            deliveryLocation: data.deliveryLocation || prevOrder.deliveryLocation,
          }));
        }
      });

      // 在組件卸載時清除監聽器
      return () => {
        socket.off('orderStatusUpdate');
      };
    } else {
      console.warn('Socket 尚未連接');
    }
  }, [selectedOrder]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    joinOrderRoom(order.id);
  };

  const handleDeselectOrder = () => {
    if (selectedOrder) {
      leaveOrderRoom(selectedOrder.id);
      setSelectedOrder(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      {/* 使用 LogoutButton 組件 */}
      <LogoutButton />
      <div className="mt-4 flex flex-col space-y-4"> {/* 直列式布局 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-center text-blue-600 underline">附近餐廳</h2> {/* 居中顯示並增加醒目效果 */}
          <NearbyRestaurants userLocation={userLocation} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-center text-blue-600 underline">熱門菜品</h2> {/* 居中顯示並增加醒目效果 */}
          <PopularDishes addToCart={addToCart} /> {/* 傳遞 addToCart 函數 */}
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-center text-blue-600 underline">個性化推薦</h2> {/* 居中顯示並增加醒目效果 */}
          <PersonalizedRecommendations userId={localStorage.getItem('userId')} />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-center text-blue-600 underline">菜單瀏覽</h2> {/* 居中顯示並增加醒目效果 */}
          <MenuBrowser />
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold mb-2 text-center text-blue-600 underline">購物車</h2> {/* 居中顯示並增加醒目效果 */}
          <ShoppingCart cartItems={cartItems} setCartItems={setCartItems} /> {/* 傳遞購物車項目 */}
        </div>
      </div>
      {selectedOrder && (
        <OrderTracking order={selectedOrder} onClose={handleDeselectOrder} />
      )}
      <PaymentPage />
      {locationError && <p className="text-red-500 mt-4">錯誤: {locationError}</p>}
    </div>
  );
};

export default UserHomePage;