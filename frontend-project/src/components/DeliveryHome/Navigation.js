import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DeliveryHome/Navigation.js

import React, { useEffect, useState, useCallback } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import {
  GoogleMap,
  LoadScript,
  DirectionsService,
  DirectionsRenderer,
} from '@react-google-maps/api';
import PropTypes from 'prop-types'; // 可選，視項目需求而定

const mapContainerStyle = {
  height: '400px',
  width: '100%',
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const Navigation = () => {
  const { currentOrders } = useDelivery(); // 正確使用 useDelivery
  const [directions, setDirections] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 選擇特定訂單進行導航
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setDirections(null); // 重置之前的方向
    setError(null); // 清除之前的錯誤
  };

  // 在訂單變更時選擇第一個訂單（可選）
  useEffect(() => {
    if (currentOrders.length > 0 && !selectedOrder) {
      handleSelectOrder(currentOrders[0]);
    } else if (currentOrders.length === 0) {
      setSelectedOrder(null);
      setDirections(null);
      setError(null);
    }
  }, [currentOrders, selectedOrder]);

  // 定義方向服務的回調函數，使用 useCallback 優化
  const directionsCallback = useCallback((response) => {
    if (response !== null) {
      if (response.status === 'OK') {
        setDirections(response);
        setLoading(false);
      } else {
        console.error(
          'Google Maps Directions response error:',
          response.status
        );
        setError('無法獲取導航路徑，請稍後再試。');
        setLoading(false);
      }
    }
  }, []);

  // 當選定訂單變更時，請求方向服務
  useEffect(() => {
    if (selectedOrder) {
      const { deliveryLocation, customerLocation } = selectedOrder;

      // 檢查位置數據的有效性
      if (
        deliveryLocation &&
        deliveryLocation.coordinates &&
        deliveryLocation.coordinates.length === 2 &&
        customerLocation &&
        customerLocation.coordinates &&
        customerLocation.coordinates.length === 2
      ) {
        setLoading(true);
        setDirections(null);
        setError(null);
      } else {
        setError('選定的訂單位置數據不完整或無效。');
      }
    }
  }, [selectedOrder]);

  return (
    <div className="navigation">
      <h2>導航與路徑規劃</h2>

      {/* 訂單選擇部分 */}
      {currentOrders.length > 1 && (
        <div className="order-selection">
          <label htmlFor="orderSelect">選擇訂單：</label>
          <select
            id="orderSelect"
            value={selectedOrder ? selectedOrder._id : ''}
            onChange={(e) => {
              const orderId = e.target.value;
              const order = currentOrders.find((o) => o._id === orderId);
              handleSelectOrder(order);
            }}
          >
            <option value="" disabled>
              請選擇訂單
            </option>
            {currentOrders.map((order) => (
              <option key={order._id} value={order._id}>
                訂單 #{order._id} - {order.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 地圖部分 */}
      {selectedOrder ? (
        <>
          <LoadScript
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={
                selectedOrder.deliveryLocation &&
                selectedOrder.deliveryLocation.coordinates &&
                selectedOrder.deliveryLocation.coordinates.length === 2
                  ? {
                      lat: selectedOrder.deliveryLocation.coordinates[1],
                      lng: selectedOrder.deliveryLocation.coordinates[0],
                    }
                  : defaultCenter
              }
              zoom={14}
            >
              {/* 請求方向服務 */}
              {loading && <p>正在獲取導航路徑...</p>}
              {selectedOrder.deliveryLocation &&
                selectedOrder.customerLocation && (
                  <DirectionsService
                    options={{
                      origin: {
                        lat: selectedOrder.deliveryLocation.coordinates[1],
                        lng: selectedOrder.deliveryLocation.coordinates[0],
                      },
                      destination: {
                        lat: selectedOrder.customerLocation.coordinates[1],
                        lng: selectedOrder.customerLocation.coordinates[0],
                      },
                      travelMode: 'DRIVING',
                    }}
                    callback={directionsCallback}
                  />
                )}

              {/* 渲染方向 */}
              {directions && <DirectionsRenderer options={{ directions }} />}
            </GoogleMap>
          </LoadScript>

          {/* 錯誤訊息部分 */}
          {error && <p className="error-message">{error}</p>}
        </>
      ) : (
        <p>沒有選定的訂單進行導航。</p>
      )}
    </div>
  );
};

// 可選：添加 PropTypes 以增強類型檢查
Navigation.propTypes = {
  // 如果有其他 props，請在此定義
};

export default Navigation;
