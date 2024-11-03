import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryHome/MapComponent.js

import React, { useState, useEffect, useRef } from 'react';
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { useDelivery } from '@context/DeliveryContext';
import axiosInstance from '@utils/axiosInstance'; // 引入 axiosInstance

const containerStyle = {
  width: '100%',
  height: '500px',
};

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapComponent = () => {
  const { currentOrders, route, location } = useDelivery();
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (route) {
      setDirections(route);
    }
  }, [route]);

  const handleDirectionsCallback = (response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirections(response);
        setError(null);
      } else {
        console.error('Directions request failed due to ' + response.status);
        setError('無法獲取路徑，請稍後再試。');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDirections = () => {
      if (currentOrders.length > 0 && location) {
        setLoading(true);
        // DirectionsService 會自動發送請求，無需手動調用
      }
    };

    fetchDirections();
  }, [currentOrders, location]);

  useEffect(() => {
    if (mapRef.current && location) {
      // 移除之前的標記
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }

      // 創建新的 AdvancedMarkerElement
      if (window.google && window.google.maps && window.google.maps.marker) {
        markerRef.current = new window.google.maps.marker.AdvancedMarkerElement(
          {
            map: mapRef.current,
            position: { lat: location.lat, lng: location.lng },
            title: '你的位置',
            // 您可以根據需要自定義更多屬性，例如 icon
            // icon: {
            //   url: 'path_to_custom_icon.png',
            //   size: new window.google.maps.Size(40, 40),
            // },
          }
        );
      }
    }
  }, [location]);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div>
        Google Maps API Key 未設置。請在 .env 文件中設置
        REACT_APP_GOOGLE_MAPS_API_KEY。
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">配送路徑</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: location.lat, lng: location.lng }}
          zoom={12}
          onLoad={(map) => (mapRef.current = map)}
        >
          {currentOrders.length > 0 && (
            <>
              <DirectionsService
                options={{
                  origin: { lat: location.lat, lng: location.lng },
                  destination: {
                    lat: currentOrders[currentOrders.length - 1]
                      .customerLocation.coordinates[1],
                    lng: currentOrders[currentOrders.length - 1]
                      .customerLocation.coordinates[0],
                  },
                  waypoints: currentOrders.slice(0, -1).map((order) => ({
                    location: {
                      lat: order.customerLocation.coordinates[1],
                      lng: order.customerLocation.coordinates[0],
                    },
                    stopover: true,
                  })),
                  optimizeWaypoints: true,
                  travelMode: 'DRIVING',
                }}
                callback={handleDirectionsCallback}
              />
              {directions && (
                <DirectionsRenderer
                  options={{
                    directions: directions,
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#4ade80',
                      strokeWeight: 5,
                    },
                  }}
                />
              )}
            </>
          )}
        </GoogleMap>
      </LoadScript>
      {loading && <div className="mt-4 text-center">正在獲取路徑...</div>}
    </div>
  );
};

export default React.memo(MapComponent);
