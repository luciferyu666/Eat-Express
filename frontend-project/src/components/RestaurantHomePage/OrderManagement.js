// src/components/RestaurantHomePage/OrderManagement.js

import React from 'react';
import OrderDetail from './OrderDetail';

const OrderManagement = ({ orders, updateOrderStatus }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">新訂單接收與處理</h2>
      {orders.length > 0 ? (
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="border rounded p-4">
              <OrderDetail order={order} updateOrderStatus={updateOrderStatus} />
            </li>
          ))}
        </ul>
      ) : (
        <p>目前沒有新訂單。</p>
      )}
    </div>
  );
};

export default OrderManagement;
