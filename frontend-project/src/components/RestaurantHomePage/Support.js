// src/components/RestaurantHomePage/Support.js

import React from 'react';

const Support = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">支持與幫助</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">技術支持聯繫</h3>
        <p><strong>電話：</strong>123-456-7890</p>
        <p><strong>電子郵件：</strong>support@restaurantapp.com</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">常見問題解答（FAQ）</h3>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong>如何更新菜單？</strong>
            <p>請前往「菜單管理」部分，選擇要編輯的菜品並進行修改。</p>
          </li>
          <li>
            <strong>如何查看銷售報表？</strong>
            <p>前往「銷售數據與報表」部分，您可以查看每日、每週和每月的銷售數據。</p>
          </li>
          <li>
            <strong>如何添加新員工？</strong>
            <p>在「員工管理」部分，填寫新員工的詳細信息並點擊「添加員工」。</p>
          </li>
          {/* 添加更多常見問題 */}
        </ul>
      </div>
    </div>
  );
};

export default Support;
