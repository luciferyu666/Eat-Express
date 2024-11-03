import { storeAuthToken } from "@utils/tokenStorage";
// src/components/UserHomePage/NearbyRestaurants.js

import React, { useEffect, useState } from 'react';
import api from '@utils/api'; // 確保導入為 api
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const NearbyRestaurants = ({ userLocation }) => {
  console.log('NearbyRestaurants - userLocation:', userLocation); // 日誌
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // 確保在 .env 文件中設置了此變量
  });

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng }
    : { lat: 25.033, lng: 121.5654 }; // 默認中心點（例如台北市政府）

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        if (!userLocation?.lat || !userLocation?.lng) {
          throw new Error('用戶位置未定義或不完整');
        }
        const response = await api.get('/restaurants/nearby', {
          params: {
            lat: userLocation.lat,
            lng: userLocation.lng,
            radius: 5000, // 半徑範圍，單位為米
          },
        });
        console.log('獲取到的餐廳數據:', response.data); // 日誌
        setRestaurants(response.data);
      } catch (error) {
        console.error('獲取附近餐廳失敗:', error);
        setError(
          error.response?.data?.error || error.message || '獲取附近餐廳失敗'
        );
      } finally {
        setLoading(false);
      }
    };

    if (userLocation) {
      fetchRestaurants();
    }
  }, [userLocation]);

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">附近餐廳</h2>
      {loading ? (
        <p>正在獲取附近餐廳...</p>
      ) : error ? (
        <p className="text-red-500">錯誤: {error}</p>
      ) : isLoaded ? (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
        >
          {restaurants.map((restaurant) =>
            restaurant.location ? (
              <Marker
                key={restaurant.id}
                position={{
                  lat: restaurant.location.lat,
                  lng: restaurant.location.lng,
                }}
                title={restaurant.name}
              />
            ) : (
              console.warn(`餐廳 ${restaurant.id} 缺少位置資訊`)
            )
          )}
          {/* 用戶位置標記 */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
              title="您的位置"
            />
          )}
        </GoogleMap>
      ) : (
        <p>載入地圖中...</p>
      )}
      <ul className="mt-4">
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <li key={restaurant.id} className="mb-2">
              <h3 className="text-lg font-semibold">{restaurant.name}</h3>
              <p>{restaurant.address}</p>
              <p>{`距離: ${(restaurant.distance / 1000).toFixed(2)} 公里`}</p>
            </li>
          ))
        ) : (
          <p>附近沒有餐廳。</p>
        )}
      </ul>
    </div>
  );
};

export default NearbyRestaurants;
