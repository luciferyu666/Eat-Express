// src/components/Support.js
import React from 'react';

const Support = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">支持與幫助</h2>
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-700">聯繫客服</h3>
        <p className="text-gray-600 mt-2">電話：1234-5678</p>
        <p className="text-gray-600">電子郵件：support@deliveryapp.com</p>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold text-gray-700">常見問題解答</h3>
        <ul className="list-disc list-inside mt-2 text-gray-600">
          <li>如何處理訂單錯誤？</li>
          <li>如何聯繫餐廳或用戶？</li>
          <li>如何更改個人資料？</li>
        </ul>
      </div>
    </div>
  );
};

export default Support;