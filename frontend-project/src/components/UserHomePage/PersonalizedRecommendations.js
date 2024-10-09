// src/components/UserHomePage/PersonalizedRecommendations.js

import React, { useEffect, useState } from 'react';
import axios from '../../utils/api';

const PersonalizedRecommendations = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  
  // 模擬數據
  const mockData = [
    {
      id: 1,
      name: '招牌牛肉麵',
      description: '濃郁的牛骨湯底，搭配新鮮的牛肉和手工麵條。',
      price: 250,
      image: 'https://via.placeholder.com/150?text=牛肉麵',
    },
    {
      id: 2,
      name: '炸雞漢堡',
      description: '酥脆的炸雞，搭配香濃的醬料，讓你一次滿足兩種口味。',
      price: 150,
      image: 'https://via.placeholder.com/150?text=炸雞漢堡',
    },
    {
      id: 3,
      name: '海鮮義大利麵',
      description: '新鮮海鮮與香濃白醬的完美結合，讓你一口接一口。',
      price: 280,
      image: 'https://via.placeholder.com/150?text=海鮮義大利麵',
    },
    {
      id: 4,
      name: '日式咖哩飯',
      description: '香濃的咖哩醬，搭配嫩滑的雞肉，讓你欲罷不能。',
      price: 200,
      image: 'https://via.placeholder.com/150?text=咖哩飯',
    },
    {
      id: 5,
      name: '鮮蝦春捲',
      description: '新鮮的蝦仁，搭配脆口的生菜，健康又美味。',
      price: 120,
      image: 'https://via.placeholder.com/150?text=鮮蝦春捲',
    },
    {
      id: 6,
      name: '水果沙拉',
      description: '新鮮的水果混合，清爽可口，是健康的選擇。',
      price: 100,
      image: 'https://via.placeholder.com/150?text=水果沙拉',
    },
  ];

  useEffect(() => {
    // 如果用戶 ID 存在，使用模擬數據
    if (userId) {
      // 這裡可以根據實際需求進行更複雜的推薦邏輯
      // 目前直接使用模擬數據進行顯示
      setRecommendations(mockData);
    }
  }, [userId]);

  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">個性化推薦</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((dish) => (
          <div key={dish.id} className="border rounded p-2">
            <img src={dish.image} alt={dish.name} className="w-full h-32 object-cover rounded" />
            <h3 className="text-lg font-semibold mt-2">{dish.name}</h3>
            <p>{dish.description}</p>
            <p className="font-bold">{`價格: $${dish.price}`}</p>
            <button className="mt-2 bg-green-500 text-white px-3 py-1 rounded">
              加入購物車
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;
