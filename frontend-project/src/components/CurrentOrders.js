// src/components/CurrentOrders.js
import React from 'react';

const CurrentOrders = ({ currentOrders, onUpdateStatus }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">待處理訂單</h2>
      {currentOrders.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {currentOrders.map((order) => (
            <li key={order.id} className="border-b pb-4">
              <p className="text-lg text-gray-700">訂單編號：{order.id}</p>
              <p className="text-gray-600">客戶地址：{order.customerAddress}</p>
              <button
                className="mt-2 px-5 py-2 bg-yellow-600 text-white rounded-lg shadow-md hover:bg-yellow-700 transition ease-in-out"
                onClick={() => onUpdateStatus(order.id, '配送中')}
              >
                更新狀態為配送中
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-4">目前沒有待處理訂單。</p>
      )}
    </div>
  );
};

export default CurrentOrders;