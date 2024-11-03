import { storeAuthToken } from "@utils/tokenStorage";
// src/components/RestaurantHomePage/OrderDetail.js

import React, { useState } from 'react';

const OrderDetail = ({ order, updateOrderStatus }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    updateOrderStatus(order.id, newStatus);
  };

  return (
    <div>
      <p>
        <strong>訂單ID：</strong>
        {order.id}
      </p>
      <p>
        <strong>客戶：</strong>
        {order.customerName}
      </p>
      <p>
        <strong>地址：</strong>
        {order.address}
      </p>
      <p>
        <strong>聯繫電話：</strong>
        {order.contact}
      </p>
      <p>
        <strong>訂單內容：</strong>
      </p>
      <ul className="list-disc list-inside">
        {order.items.map((item) => (
          <li key={item.dishId}>
            {item.name} x {item.quantity} ({item.notes})
          </li>
        ))}
      </ul>
      <p>
        <strong>總金額：</strong>${order.totalPrice}
      </p>
      <p>
        <strong>送餐時間：</strong>
        {order.deliveryTime}
      </p>
      <div className="mt-2">
        <label className="block text-gray-700">訂單狀態：</label>
        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className="border rounded px-2 py-1"
        >
          <option value="Received">已接單</option>
          <option value="Preparing">正在製作</option>
          <option value="Ready">製作完成</option>
          <option value="Delivered">已配送</option>
          <option value="Cancelled">已取消</option>
        </select>
      </div>
    </div>
  );
};

export default OrderDetail;
