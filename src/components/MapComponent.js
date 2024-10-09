// src/components/MapComponent.js

import React from 'react';
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  Marker,
} from '@react-google-maps/api';

const MapComponent = ({
  driverLocation,
  deliveryLocation,
  directionsResponse,
  onDirectionsCallback,
}) => {
  const mapContainerStyle = {
    width: '100%',
    height: '500px',
  };

  const center = {
    lat: driverLocation?.lat || 25.0330, // 台北 101 的座標
    lng: driverLocation?.lng || 121.5654,
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">導航與路徑規劃</h2>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {/* 送餐員當前位置標記 */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            label={{
              text: '您',
              color: 'white',
              fontWeight: 'bold',
            }}
            icon={{
              url: 'https://maps.google.com/mapfiles/kml/shapes/man.png',
              scaledSize: new window.google.maps.Size(50, 50),
            }}
          />
        )}

        {/* 客戶位置標記 */}
        {deliveryLocation && (
          <Marker
            position={deliveryLocation}
            label={{
              text: '客戶',
              color: 'white',
              fontWeight: 'bold',
            }}
            icon={{
              url: 'https://maps.google.com/mapfiles/kml/pal4/icon54.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        )}

        {/* DirectionsService 提供路線規劃 */}
        {driverLocation && deliveryLocation && (
          <DirectionsService
            options={{
              destination: deliveryLocation, // 目的地是客戶地址
              origin: driverLocation, // 起點是送餐員當前位置
              travelMode: 'DRIVING', // 配送方式為駕車
            }}
            callback={onDirectionsCallback}
          />
        )}

        {/* DirectionsRenderer 用於渲染路徑 */}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapComponent;