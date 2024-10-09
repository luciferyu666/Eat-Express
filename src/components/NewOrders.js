// src/components/NewOrders.js
import React from 'react';

const NewOrders = ({ newOrders, onAcceptOrder }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">新訂單</h2>
      {newOrders.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {newOrders.map((order) => (
            <li key={order.id} className="border-b pb-4">
              <p className="text-lg text-gray-700">訂單編號：{order.id}</p>
              <p className="text-gray-600">餐廳地址：{order.restaurantAddress}</p>
              <p className="text-gray-600">客戶地址：{order.customerAddress}</p>
              <p className="text-gray-600">
                訂單內容：{order.items.map((item) => item.name).join(', ')}
              </p>
              <button
                className="mt-2 px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition ease-in-out"
                onClick={() => onAcceptOrder(order.id, order.customerAddress)}
              >
                接單
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 mt-4">目前沒有新訂單。</p>
      )}
    </div>
  );
};

export default NewOrders;