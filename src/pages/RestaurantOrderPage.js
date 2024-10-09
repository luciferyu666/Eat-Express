import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket';  // 引入 WebSocket 配置

const RestaurantOrderPage = () => {
  const [orders, setOrders] = useState([]);  // 訂單列表
  const [selectedOrder, setSelectedOrder] = useState(null);  // 當前選擇的訂單

  // 從後端獲取所有待處理訂單
  useEffect(() => {
    axios.get('/api/orders')
      .then(response => setOrders(response.data))
      .catch(error => console.error('Error fetching orders:', error));
  }, []);

  // 當有新訂單時，通過 WebSocket 實時接收
  useEffect(() => {
    socket.on('newOrder', (newOrder) => {
      setOrders(prevOrders => [newOrder, ...prevOrders]);  // 新訂單插入到列表頂部
    });

    return () => {
      socket.off('newOrder');  // 組件卸載時清理 WebSocket 連接
    };
  }, []);

  // 設置選擇的訂單
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  // 更新訂單狀態，並通知後端
  const updateOrderStatus = async (status) => {
    try {
      await axios.put(`/api/orders/${selectedOrder.id}/status`, { status });
      setOrders(prevOrders => prevOrders.map(order => 
        order.id === selectedOrder.id ? { ...order, status } : order
      ));
      setSelectedOrder(null);  // 更新狀態後清除選擇的訂單
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // 訂單狀態顯示邏輯
  const renderOrderStatus = (status) => {
    switch (status) {
      case 'submitted':
        return '訂單已提交';
      case 'confirmed':
        return '餐廳已接單';
      case 'preparing':
        return '正在製作';
      case 'completed':
        return '製作完成';
      case 'outForDelivery':
        return '配送中';
      default:
        return '未知狀態';
    }
  };

  return (
    <div className="restaurant-orders">
      <h1>餐廳訂單管理</h1>

      {/* 訂單列表 */}
      <div className="order-list">
        <h2>待處理訂單</h2>
        <ul>
          {orders.map(order => (
            <li key={order.id} onClick={() => handleSelectOrder(order)}>
              <span>訂單號：{order.id}</span>
              <span>狀態：{renderOrderStatus(order.status)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 選擇的訂單詳情 */}
      {selectedOrder && (
        <div className="order-details">
          <h3>訂單詳情</h3>
          <p>訂單號：{selectedOrder.id}</p>
          <p>用戶聯絡方式：{selectedOrder.customerPhone}</p>
          <p>配送地址：{selectedOrder.deliveryAddress}</p>
          <p>菜品：</p>
          <ul>
            {selectedOrder.items.map(item => (
              <li key={item.id}>
                {item.name} - {item.quantity}份
              </li>
            ))}
          </ul>

          {/* 訂單狀態操作按鈕 */}
          <div className="order-status-actions">
            {selectedOrder.status === 'submitted' && (
              <button onClick={() => updateOrderStatus('confirmed')}>
                確認訂單
              </button>
            )}
            {selectedOrder.status === 'confirmed' && (
              <button onClick={() => updateOrderStatus('preparing')}>
                設置為製作中
              </button>
            )}
            {selectedOrder.status === 'preparing' && (
              <button onClick={() => updateOrderStatus('completed')}>
                完成製作
              </button>
            )}
            {selectedOrder.status === 'completed' && (
              <button onClick={() => updateOrderStatus('outForDelivery')}>
                外送中
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrderPage;
