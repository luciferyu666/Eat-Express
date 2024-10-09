// src/components/UserHomePage/OrderTracking.js

import React, { useEffect, useState } from 'react';
import {
  GoogleMap,
  Marker,
  Polyline,
  useJsApiLoader,
} from '@react-google-maps/api';
import { joinOrderRoom, leaveOrderRoom, getSocket } from '../../socket';

const OrderTracking = ({ order, onClose }) => {
  const [deliveryLocation, setDeliveryLocation] = useState(
    order.deliveryLocation || null
  );
  const [orderStatus, setOrderStatus] = useState(order.status);

  useEffect(() => {
    // 加入訂單房間
    joinOrderRoom(order.id);

    // 當訂單狀態更新時，自動更新狀態和配送位置
    const handleOrderStatusUpdate = (data) => {
      if (data.orderId === order.id) {
        setOrderStatus(data.status);
        if (data.deliveryLocation) {
          setDeliveryLocation(data.deliveryLocation);
        }
      }
    };

    const socket = getSocket();
    socket.on('orderStatusUpdate', handleOrderStatusUpdate);

    return () => {
      // 離開訂單房間
      leaveOrderRoom(order.id);
      socket.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, [order.id]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  // 添加防禦性編碼
  const center = deliveryLocation
    ? deliveryLocation.lat && deliveryLocation.lng
      ? {
          lat: deliveryLocation.lat,
          lng: deliveryLocation.lng,
        }
      : { lat: 25.0330, lng: 121.5654 } // 默認位置
    : order.restaurantLocation &&
      order.restaurantLocation.lat &&
      order.restaurantLocation.lng
    ? {
        lat: order.restaurantLocation.lat,
        lng: order.restaurantLocation.lng,
      }
    : { lat: 25.0330, lng: 121.5654 }; // 默認位置

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-4 w-11/12 md:w-3/4 lg:w-1/2 relative">
        <button
          className="absolute top-2 right-2 text-red-500"
          onClick={onClose}
        >
          關閉
        </button>
        <h2 className="text-2xl font-bold mb-2">訂單追蹤</h2>
        <p className="mb-2">{`訂單狀態: ${orderStatus}`}</p>
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={14}
          >
            {/* 餐廳位置標記 */}
            {order.restaurantLocation &&
              order.restaurantLocation.lat &&
              order.restaurantLocation.lng && (
                <Marker
                  position={{
                    lat: order.restaurantLocation.lat,
                    lng: order.restaurantLocation.lng,
                  }}
                  label="餐廳"
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                  }}
                />
              )}
            {/* 外送員位置標記 */}
            {deliveryLocation &&
              deliveryLocation.lat &&
              deliveryLocation.lng && (
                <Marker
                  position={{
                    lat: deliveryLocation.lat,
                    lng: deliveryLocation.lng,
                  }}
                  label="外送員"
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  }}
                />
              )}
            {/* 路徑線條 */}
            {deliveryLocation &&
              order.restaurantLocation &&
              order.restaurantLocation.lat &&
              order.restaurantLocation.lng &&
              deliveryLocation.lat &&
              deliveryLocation.lng && (
                <Polyline
                  path={[
                    {
                      lat: order.restaurantLocation.lat,
                      lng: order.restaurantLocation.lng,
                    },
                    {
                      lat: deliveryLocation.lat,
                      lng: deliveryLocation.lng,
                    },
                  ]}
                  options={{
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                  }}
                />
              )}
          </GoogleMap>
        ) : (
          <p>載入地圖中...</p>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;