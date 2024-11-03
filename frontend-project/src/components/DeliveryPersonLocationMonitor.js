import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DeliveryPersonLocationMonitor.js

import React, { useEffect, useState } from 'react';
// 假設使用 Google Maps
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import axios from 'axios';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center = {
  lat: 25.033, // 台北市經緯度，可根據需要調整
  lng: 121.5654,
};

const DeliveryPersonLocationMonitor = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    // 從後端獲取外送員位置數據
    const fetchLocations = async () => {
      try {
        // 更新請求 URL 指向正確的後端 API
        const response = await axios.get(
          'http://localhost:5000/api/delivery-person/locations'
        );
        // 假設返回的數據格式為 [{ location: { lat: ..., lng: ... } }, ...]
        setLocations(response.data);
      } catch (error) {
        console.error('獲取外送員位置失敗', error);
      }
    };

    fetchLocations();

    // 清理（可選的 WebSocket 實時更新邏輯，這裡目前注釋掉）
    // const socket = io.connect('http://localhost:5000');
    // socket.on('locationUpdate', data => {
    //   setLocations(data);
    // });
    // return () => socket.disconnect();
  }, []);

  return (
    <div className="delivery-person-location-monitor mb-4">
      <h3 className="text-xl font-semibold mb-2">外送員位置監控</h3>
      <LoadScript googleMapsApiKey="AIzaSyA1rT_LEzTxgfMdPSibaI9C5ePMEmvcCsA">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
        >
          {locations.map((deliveryPerson, index) => (
            <Marker
              key={index}
              position={{
                lat: deliveryPerson.location.coordinates[1], // 確保數據格式與後端一致
                lng: deliveryPerson.location.coordinates[0],
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default DeliveryPersonLocationMonitor;
