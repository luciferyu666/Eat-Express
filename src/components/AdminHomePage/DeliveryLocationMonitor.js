// frontend-project/src/components/AdminHomePage/DeliveryLocationMonitor.js

import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import api from '../../utils/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = { lat: 25.0330, lng: 121.5654 }; // 台北市中心坐標，可根據需要調整

const DeliveryLocationMonitor = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  
  // 使用 useJsApiLoader 來控制 Google Maps API 的加載狀態
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    fetchDeliveryPersons();
    const interval = setInterval(fetchDeliveryPersons, 5000); // 每5秒更新一次位置
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryPersons = async () => {
    try {
      const response = await api.get('/deliveryPersons/activeLocations');
      setDeliveryPersons(response.data);
    } catch (error) {
      console.error('獲取外送員位置失敗:', error);
    }
  };

  if (loadError) {
    return <div>無法加載地圖</div>;
  }

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold mb-2">外送員位置監控</h4>
      {isLoaded ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
        >
          {deliveryPersons.map(dp => (
            <Marker
              key={dp.id}
              position={{ lat: dp.location.lat, lng: dp.location.lng }}
              label={dp.name}
            />
          ))}
        </GoogleMap>
      ) : (
        <div>正在加載地圖...</div>
      )}
    </div>
  );
};

export default DeliveryLocationMonitor;