import { storeAuthToken } from "@utils/tokenStorage";
// src/components/RestaurantHomePage/Notifications.js

import React from 'react';

const Notifications = ({ notifications }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">通知和公告</h2>
      {notifications.length > 0 ? (
        <ul className="space-y-4">
          {notifications.map((notification) => (
            <li key={notification.id} className="border rounded p-4">
              <p className="font-semibold">{notification.title}</p>
              <p className="text-gray-600">{notification.message}</p>
              <p className="text-sm text-gray-500">
                {new Date(notification.date).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>目前沒有新的通知。</p>
      )}
    </div>
  );
};

export default Notifications;
