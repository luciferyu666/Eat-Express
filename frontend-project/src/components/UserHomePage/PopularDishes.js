import { storeAuthToken } from "@utils/tokenStorage";
// src/components/UserHomePage/PopularDishes.js

import React, { useEffect, useState } from 'react';
import axios from '@utils/api';

const PopularDishes = ({ addToCart }) => {
  // 接收 addToCart 函數作為道具
  const [popularDishes, setPopularDishes] = useState([]);

  useEffect(() => {
    axios
      .get('/dishes/popular')
      .then((response) => setPopularDishes(response.data))
      .catch((error) => console.error('獲取熱門菜品失敗:', error));
  }, []);

  // 占位符圖片 URL
  const placeholderImage = 'https://via.placeholder.com/150'; // 可替換為其他占位符圖片 URL

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">熱門菜品</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {popularDishes.map((dish) => (
          <div key={dish.id} className="border rounded p-2">
            <img
              src={placeholderImage}
              alt={dish.name}
              className="w-full h-32 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-2">{dish.name}</h3>
            <p>{dish.description}</p>
            <p className="font-bold">{`價格: $${dish.price}`}</p>
            <button
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => addToCart(dish)} // 添加點擊事件處理器
            >
              加入購物車
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularDishes;
