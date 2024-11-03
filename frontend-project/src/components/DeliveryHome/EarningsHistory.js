import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/DeliveryHome/EarningsHistory.js

import React, { useEffect, useState } from 'react';
import { useDelivery } from '@context/DeliveryContext';
import { getOrderHistory } from '@services/deliveryService';
import axiosInstance from '@utils/axiosInstance'; // 使用 axiosInstance
import { getSocket } from '@utils/socket'; // 使用具名匯入 getSocket

const EarningsHistory = () => {
  const { earnings, setCurrentOrders, setEarnings } = useDelivery();
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 獲取歷史訂單的副作用
  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const history = await getOrderHistory(); // 確保 getOrderHistory 使用正確的 API 路徑
        setOrderHistory(history.orders);
        setEarnings(history.totalEarnings); // 假設後端返回 totalEarnings
      } catch (error) {
        console.error(
          'Error fetching order history:',
          error.response?.data?.error || error.message
        );
        setError('獲取歷史訂單失敗，請稍後再試。');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderHistory();
  }, [setOrderHistory, setEarnings]);

  // 設置 Socket.IO 事件監聽
  useEffect(() => {
    const socket = getSocket(); // 使用 getSocket 獲取 Socket.IO 實例

    if (!socket) {
      console.error('Socket 尚未連接');
      return;
    }

    const handleOrderStatusUpdate = ({ orderId, status, deliveryLocation }) => {
      setOrderHistory((prevHistory) =>
        prevHistory.map((order) =>
          order._id === orderId ? { ...order, status, deliveryLocation } : order
        )
      );

      // 如果訂單狀態變為完成，更新收益
      if (status === 'Delivered') {
        const updatedOrder = orderHistory.find(
          (order) => order._id === orderId
        );
        if (updatedOrder) {
          setEarnings((prevEarnings) => prevEarnings + updatedOrder.totalPrice);
        }
      }
    };

    socket.on('orderStatusUpdate', handleOrderStatusUpdate);

    // 清理事件監聽器
    return () => {
      socket.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, [setOrderHistory, setEarnings, orderHistory]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await axiosInstance.patch(`/orders/${orderId}/status`, {
        status: newStatus,
      });
      const updatedOrder = response.data.order;

      // 更新本地 orderHistory 狀態
      setOrderHistory((prevHistory) =>
        prevHistory.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      // 更新上下文 currentOrders
      setCurrentOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );

      // 更新收益，如果狀態為 'Delivered'
      if (updatedOrder.status === 'Delivered') {
        setEarnings((prevEarnings) => prevEarnings + updatedOrder.totalPrice);
      }

      console.log('訂單狀態更新成功:', updatedOrder);
    } catch (error) {
      console.error(
        '更新訂單狀態失敗:',
        error.response?.data?.error || error.message
      );
      setError('更新訂單狀態失敗，請稍後再試。');
    }
  };

  return (
    <div className="earnings-history bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">收益與歷史訂單</h2>
      {loading ? (
        <p className="text-gray-700">正在加載收益與歷史訂單...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <p className="text-gray-700">今日收益：${earnings.toFixed(2)}</p>
          <h3 className="text-lg font-semibold mt-4">歷史訂單</h3>
          {orderHistory.length === 0 ? (
            <p className="text-gray-500">沒有歷史訂單記錄。</p>
          ) : (
            <table className="min-w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">訂單編號</th>
                  <th className="border border-gray-300 p-2">餐廳</th>
                  <th className="border border-gray-300 p-2">客戶</th>
                  <th className="border border-gray-300 p-2">金額</th>
                  <th className="border border-gray-300 p-2">狀態</th>
                  <th className="border border-gray-300 p-2">更新狀態</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order) => (
                  <tr key={order._id}>
                    <td className="border border-gray-300 p-2">{order._id}</td>
                    <td className="border border-gray-300 p-2">
                      {order.restaurantName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {order.customerName}
                    </td>
                    <td className="border border-gray-300 p-2">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {order.status}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className="mt-2 p-2 border rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default EarningsHistory;
