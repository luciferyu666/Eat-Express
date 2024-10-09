// src/components/OrderStatusUpdater.js
import React from 'react';

const OrderStatusUpdater = ({ navigationDetails }) => {
  if (!navigationDetails) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">導航詳細資訊</h2>
      <p className="text-gray-700 mt-2">
        總距離：{navigationDetails.distance}，預計時間：{navigationDetails.duration}
      </p>
      <ol className="list-decimal list-inside mt-4 space-y-2">
        {navigationDetails.steps.map((step, index) => (
          <li key={index} className="text-gray-700">
            <div
              dangerouslySetInnerHTML={{ __html: step.instructions }}
            ></div>
            <p className="text-sm text-gray-500">
              距離：{step.distance}，時間：{step.duration}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default OrderStatusUpdater;