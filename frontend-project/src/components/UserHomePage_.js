// src/components/UserHomePage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from '../socket'; // 引入 WebSocket 連接
import LogoutButton from './LogoutButton'; // 引入登出按鈕

const UserHomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [popularDishes, setPopularDishes] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');

  // 模擬餐廳數據
  const mockRestaurants = [
    { id: 'R001', name: '川湘館', description: '正宗川湘美食，香辣可口' },
    { id: 'R002', name: '日式料理', description: '新鮮壽司和美味拉麵' },
    { id: 'R003', name: '印度風味', description: '濃郁香料與多樣咖喱' },
    { id: 'R004', name: '義式披薩店', description: '地道義大利披薩，香脆可口' },
    { id: 'R005', name: '美式漢堡', description: '多汁漢堡和薯條' },
    { id: 'R006', name: '泰國小館', description: '酸辣開胃的泰國料理' },
  ];

  // 模擬菜單數據
  const mockMenu = [
    {
      id: 'D001',
      name: '宮保雞丁',
      price: 150,
      description: '辣味雞丁配花生',
      image: 'https://via.placeholder.com/150',
      category: '主菜',
    },
    {
      id: 'D002',
      name: '紅燒牛肉麵',
      price: 120,
      description: '經典牛肉湯麵',
      image: 'https://via.placeholder.com/150',
      category: '主菜',
    },
    {
      id: 'D003',
      name: '珍珠奶茶',
      price: 50,
      description: '香甜濃郁的奶茶',
      image: 'https://via.placeholder.com/150',
      category: '飲品',
    },
    {
      id: 'D004',
      name: '抹茶冰淇淋',
      price: 80,
      description: '清新可口的抹茶冰淇淋',
      image: 'https://via.placeholder.com/150',
      category: '甜點',
    },
    {
      id: 'D005',
      name: '披薩四重奏',
      price: 200,
      description: '包含四種口味的披薩',
      image: 'https://via.placeholder.com/150',
      category: '主菜',
    },
    {
      id: 'D006',
      name: '芒果糯米飯',
      price: 90,
      description: '甜美芒果搭配糯米',
      image: 'https://via.placeholder.com/150',
      category: '甜點',
    },
    {
      id: 'D007',
      name: '泰式炒河粉',
      price: 130,
      description: '香辣泰式炒河粉',
      image: 'https://via.placeholder.com/150',
      category: '主菜',
    },
    {
      id: 'D008',
      name: '綠咖哩雞',
      price: 160,
      description: '濃郁綠咖哩搭配雞肉',
      image: 'https://via.placeholder.com/150',
      category: '主菜',
    },
  ];

  // 增加“熱門菜品”的模擬數據
  const mockPopularDishes = [
    {
      id: 'D001',
      name: '宮保雞丁',
      price: 150,
      description: '辣味雞丁配花生，口感鮮辣',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 'D003',
      name: '珍珠奶茶',
      price: 50,
      description: '濃郁奶香，甜而不膩',
      image: 'https://via.placeholder.com/150',
    },
    {
      id: 'D005',
      name: '披薩四重奏',
      price: 200,
      description: '四種經典口味，滿足你的味蕾',
      image: 'https://via.placeholder.com/150',
    },
  ];

  // 獲取附近餐廳數據
  useEffect(() => {
    setRestaurants(mockRestaurants); // 使用模擬數據
  }, []);

  // 獲取熱門菜品數據
  useEffect(() => {
    const fetchPopularDishes = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/dishes/popular');
        setPopularDishes(data);
      } catch (error) {
        console.error('Error fetching popular dishes:', error);
        setPopularDishes(mockPopularDishes); // 使用模擬數據
      }
    };
    fetchPopularDishes();
  }, []);

  // 監聽訂單狀態更新
  useEffect(() => {
    const handleOrderStatusUpdate = (data) => {
      setOrderStatus(`訂單 ${data.orderId} 狀態更新為: ${data.status}`);
    };

    socket.on('orderStatusUpdate', handleOrderStatusUpdate);
    return () => {
      socket.off('orderStatusUpdate', handleOrderStatusUpdate);
    };
  }, []);

  // 搜索餐廳或菜品
  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const { data } = await axios.get(`http://localhost:5000/api/restaurants/search?q=${search}`);
      setRestaurants(data);
    } catch (error) {
      console.error('Error searching restaurants or dishes:', error);
      setRestaurants(mockRestaurants.filter((restaurant) => restaurant.name.includes(search)));
    }
  };

  // 顯示選中餐廳的菜單
  const handleViewMenu = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMenu(mockMenu);
  };

  // 添加菜品至購物車
  const handleAddToCart = (dish) => {
    setCart((prevCart) => {
      const existingDish = prevCart.find((item) => item.id === dish.id);
      if (existingDish) {
        return prevCart.map((item) => (item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        return [...prevCart, { ...dish, quantity: 1, note: '' }];
      }
    });
  };

  // 更新購物車中的菜品數量和備註
  const handleUpdateCart = (dishId, quantity, note) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === dishId ? { ...item, quantity, note } : item))
    );
  };

  // 刪除購物車中的菜品
  const handleRemoveFromCart = (dishId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== dishId));
  };

  return (
    <div className="homepage bg-gray-100 min-h-screen p-6">
      <div className="container mx-auto">
        {/* 頁面頂部 - 標題和登出按鈕 */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-4">附近的餐廳</h1>
          <LogoutButton />
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex items-center justify-center mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索餐廳或菜品"
            className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4"
          />
          <button type="submit" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition">
            搜索
          </button>
        </form>

        {/* 附近餐廳列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <h3 className="text-2xl font-semibold text-gray-700">{restaurant.name}</h3>
                <p className="text-gray-600 mt-2">{restaurant.description}</p>
                <button
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => handleViewMenu(restaurant)}
                >
                  查看菜單
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">附近沒有餐廳</p>
          )}
        </div>

        {/* 選中的餐廳菜單 */}
        {selectedRestaurant && (
          <div className="menu-section mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{selectedRestaurant.name} 的菜單</h2>
            {menu.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menu.map((dish) => (
                  <div key={dish.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                    <img src={dish.image} alt={dish.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                    <h3 className="text-2xl font-semibold text-gray-700">{dish.name}</h3>
                    <p className="text-gray-600 mt-2">{dish.description}</p>
                    <p className="text-gray-800 font-bold mt-2">${dish.price}</p>
                    <button
                      className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                      onClick={() => handleAddToCart(dish)}
                    >
                      添加至購物車
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">目前沒有菜單。</p>
            )}
          </div>
        )}

        {/* 購物車 */}
        {cart.length > 0 && (
          <div className="cart-section mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">購物車</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {cart.map((item) => (
                <div key={item.id} className="border-b pb-4 mb-4">
                  <h3 className="text-2xl font-semibold text-gray-700">{item.name}</h3>
                  <p className="text-gray-600">價格：${item.price}</p>
                  <label className="block text-gray-700 mt-2">
                    數量：
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => handleUpdateCart(item.id, parseInt(e.target.value), item.note)}
                      className="w-16 p-2 border border-gray-300 rounded-lg ml-2"
                    />
                  </label>
                  <label className="block text-gray-700 mt-2">
                    備註：
                    <input
                      type="text"
                      value={item.note}
                      onChange={(e) => handleUpdateCart(item.id, item.quantity, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg mt-1"
                    />
                  </label>
                  <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    刪除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 熱門菜品 */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6">熱門菜品</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {popularDishes.length > 0 ? (
            popularDishes.map((dish) => (
              <div key={dish.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <img src={dish.image} alt={dish.name} className="w-full h-40 object-cover rounded-lg mb-4" />
                <h3 className="text-2xl font-semibold text-gray-700">{dish.name}</h3>
                <p className="text-gray-600 mt-2">{dish.description}</p>
                <p className="text-gray-800 font-bold mt-2">${dish.price}</p>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500">暫無熱門菜品</p>
          )}
        </div>

        {/* 訂單狀態實時更新顯示 */}
        {orderStatus && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700">訂單狀態更新</h3>
            <p className="text-gray-600">{orderStatus}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHomePage;
