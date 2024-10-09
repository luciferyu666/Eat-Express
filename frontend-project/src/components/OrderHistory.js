// src/components/OrderHistory.js
import React from 'react';

const OrderHistory = ({ historyOrders }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">歷史訂單</h2>
      {historyOrders.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {historyOrders.map((order) => (
            <li key={order.id} className="border-b pb-4">
              <p className="text-lg text-gray-700">訂單編號：{order.id}</p>
              <p className="text-gray-600">
                配送日期：{new Date(order.deliveryDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">收益：${order.earnings}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-4">目前沒有歷史訂單。</p>
      )}
    </div>
  );
};

export default OrderHistory;