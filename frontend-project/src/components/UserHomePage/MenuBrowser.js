import { storeAuthToken } from "@utils/tokenStorage";
// src/components/UserHomePage/MenuBrowser.js

import React, { useEffect, useState } from 'react';
import axios from '@utils/api';

const MenuBrowser = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderSuccess, setOrderSuccess] = useState(''); // 新增狀態來顯示訂單成功訊息

  // 模擬數據
  const mockRestaurants = [
    { id: 1, name: '美味餐廳' },
    { id: 2, name: '快樂小吃' },
    { id: 3, name: '精緻料理' },
  ];

  const mockMenu = [
    {
      restaurantId: 1,
      categories: [
        {
          id: 1,
          name: '主菜',
          dishes: [
            {
              id: 1,
              name: '招牌牛肉麵',
              description: '濃郁的牛骨湯底，搭配新鮮的牛肉和手工麵條。',
              price: 250,
              image: 'https://via.placeholder.com/150?text=牛肉麵',
            },
            {
              id: 2,
              name: '日式咖哩飯',
              description: '香濃的咖哩醬，搭配嫩滑的雞肉，讓你欲罷不能。',
              price: 200,
              image: 'https://via.placeholder.com/150?text=咖哩飯',
            },
          ],
        },
        {
          id: 2,
          name: '飲品',
          dishes: [
            {
              id: 3,
              name: '鮮榨果汁',
              description: '新鮮現榨的橙汁，營養美味。',
              price: 100,
              image: 'https://via.placeholder.com/150?text=果汁',
            },
          ],
        },
      ],
    },
    {
      restaurantId: 2,
      categories: [
        {
          id: 3,
          name: '小吃',
          dishes: [
            {
              id: 4,
              name: '炸雞漢堡',
              description: '酥脆的炸雞，搭配香濃的醬料，讓你一次滿足兩種口味。',
              price: 150,
              image: 'https://via.placeholder.com/150?text=炸雞漢堡',
            },
            {
              id: 5,
              name: '春捲',
              description: '新鮮的蔬菜和肉類包裹而成，健康美味。',
              price: 120,
              image: 'https://via.placeholder.com/150?text=春捲',
            },
          ],
        },
      ],
    },
    {
      restaurantId: 3,
      categories: [
        {
          id: 4,
          name: '甜點',
          dishes: [
            {
              id: 6,
              name: '提拉米蘇',
              description: '經典的義式甜點，口感細膩。',
              price: 180,
              image: 'https://via.placeholder.com/150?text=提拉米蘇',
            },
          ],
        },
      ],
    },
  ];

  useEffect(() => {
    // 模擬獲取餐廳數據
    setRestaurants(mockRestaurants);
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      // 根據選擇的餐廳獲取菜單數據
      const restaurantMenu = mockMenu.find(
        (menu) => menu.restaurantId === selectedRestaurant.id
      );
      setMenu(restaurantMenu ? restaurantMenu.categories : []);
    }
  }, [selectedRestaurant]);

  const handleAddToCart = (dish) => {
    const existingItem = cart.find((item) => item.dish.id === dish.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.dish.id === dish.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { dish, quantity: 1, notes: '' }]);
    }
  };

  const handleQuantityChange = (dishId, quantity) => {
    setCart(
      cart.map((item) =>
        item.dish.id === dishId ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  const handleNotesChange = (dishId, notes) => {
    setCart(
      cart.map((item) => (item.dish.id === dishId ? { ...item, notes } : item))
    );
  };

  const handleRemoveFromCart = (dishId) => {
    setCart(cart.filter((item) => item.dish.id !== dishId));
  };

  const handleCheckout = () => {
    // 處理結帳邏輯
    if (cart.length === 0) {
      alert('購物車是空的！請添加菜品後再結帳。');
      return;
    }

    // 假設我們將訂單發送到後端
    const orderData = {
      restaurantId: selectedRestaurant.id,
      items: cart.map((item) => ({
        dishId: item.dish.id,
        quantity: item.quantity,
        notes: item.notes,
      })),
    };

    // 模擬發送訂單請求
    console.log('發送訂單:', orderData);
    setOrderSuccess('訂單提交成功！感謝您的訂購！'); // 設置訂單成功訊息
    setCart([]); // 清空購物車
  };

  return (
    <div className="mt-4 bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">菜單瀏覽與點餐</h2>
      <div className="flex flex-col md:flex-row">
        {/* 餐廳列表 */}
        <div className="md:w-1/4 mr-4">
          <h3 className="text-lg font-semibold mb-2">餐廳列表</h3>
          <ul className="max-h-64 overflow-y-auto">
            {restaurants.map((restaurant) => (
              <li
                key={restaurant.id}
                className={`p-2 cursor-pointer ${
                  selectedRestaurant && selectedRestaurant.id === restaurant.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                {restaurant.name}
              </li>
            ))}
          </ul>
        </div>

        {/* 菜單顯示 */}
        <div className="md:w-2/4 mr-4">
          {selectedRestaurant ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {selectedRestaurant.name} 的菜單
              </h3>
              {menu.map((category) => (
                <div key={category.id} className="mb-4">
                  <h4 className="text-md font-semibold">{category.name}</h4>
                  <ul>
                    {category.dishes.map((dish) => (
                      <li
                        key={dish.id}
                        className="flex items-center justify-between p-2 border-b"
                      >
                        <div>
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <h5 className="font-semibold">{dish.name}</h5>
                          <p className="text-sm">{dish.description}</p>
                          <p className="text-sm font-bold">{`價格: $${dish.price}`}</p>
                        </div>
                        <button
                          className="bg-green-500 text-white px-3 py-1 rounded"
                          onClick={() => handleAddToCart(dish)}
                        >
                          加入
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p>請選擇一個餐廳以瀏覽菜單。</p>
          )}
        </div>

        {/* 購物車 */}
        <div className="md:w-1/4">
          <h3 className="text-lg font-semibold mb-2">購物車</h3>
          {cart.length > 0 ? (
            <ul>
              {cart.map((item) => (
                <li key={item.dish.id} className="mb-2 border p-2 rounded">
                  <div className="flex justify-between">
                    <span>{item.dish.name}</span>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveFromCart(item.dish.id)}
                    >
                      刪除
                    </button>
                  </div>
                  <div className="flex items-center mt-1">
                    <label className="mr-2">數量:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.dish.id, e.target.value)
                      }
                      className="w-16 border rounded px-2 py-1"
                    />
                  </div>
                  <div className="mt-1">
                    <label>備註:</label>
                    <textarea
                      value={item.notes}
                      onChange={(e) =>
                        handleNotesChange(item.dish.id, e.target.value)
                      }
                      className="w-full border rounded px-2 py-1"
                      placeholder="例如: 無辣, 少鹽"
                    />
                  </div>
                </li>
              ))}
              <div className="mt-4">
                <p className="font-bold">{`總金額: $${cart.reduce(
                  (total, item) => total + item.dish.price * item.quantity,
                  0
                )}`}</p>
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
                  onClick={handleCheckout} // 添加結帳按鈕
                >
                  完成訂單
                </button>
              </div>
            </ul>
          ) : (
            <p>購物車是空的。</p>
          )}
          {orderSuccess && (
            <p className="text-green-500 mt-2">{orderSuccess}</p>
          )}{' '}
          {/* 顯示訂單成功訊息 */}
        </div>
      </div>
    </div>
  );
};

export default MenuBrowser;
