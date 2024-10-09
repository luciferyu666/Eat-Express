// src/components/Earnings.js
import React from 'react';

const Earnings = ({ earnings }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">收益數據</h2>
      <p className="text-lg text-gray-700 mt-2">今日收益：${earnings.daily}</p>
      <p className="text-gray-600">本週收益：${earnings.weekly}</p>
    </div>
  );
};

export default Earnings;