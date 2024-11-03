import { storeAuthToken } from "@utils/tokenStorage";
// DeliveryHomePage/CurrentOrders.js

import React, { useEffect, useState } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import axiosInstance from '@utils/axiosInstance';

const CurrentOrders = () => {
  const { currentOrders, setCurrentOrders } = useDelivery();
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCurrentOrders = async () => {
      try {
        const response = await axiosInstance.get(
          '/delivery-person/orders/current',
          {
            signal: controller.signal,
          }
        );
        setCurrentOrders(response.data.orders);
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error(
            '获取当前订单失败:',
            error.response?.data?.error || error.message
          );
          setError('无法获取当前订单，请稍后重试。');
        }
      }
    };

    fetchCurrentOrders();

    return () => {
      controller.abort();
    };
  }, [setCurrentOrders]);

  return (
    <section className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">当前订单</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {currentOrders && currentOrders.length === 0 ? (
        <p className="text-gray-500">目前没有正在配送的订单。</p>
      ) : (
        <ul className="space-y-4">
          {currentOrders.map((order) => (
            <li key={order._id} className="border-b pb-4">
              <p className="text-lg font-semibold text-gray-700">
                订单ID：{order._id}
              </p>
              <p className="text-gray-600">
                客户地址：{order.user?.address || '未知地址'}
              </p>
              <p className="text-gray-600">
                状态：{order.status || '未知状态'}
              </p>
              {/* 可以添加更多订单相关信息 */}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CurrentOrders;
