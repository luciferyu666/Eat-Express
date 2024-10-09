import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [newDish, setNewDish] = useState({ name: '', price: 0, description: '' });

  // 獲取餐廳的訂單
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        setOrders(response.data);
      } catch (error) {
        console.error('無法獲取訂單', error);
      }
    };

    fetchOrders();
  }, []);

  // 獲取餐廳的菜單
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('/api/restaurants/menu');
        setMenuItems(response.data);
      } catch (error) {
        console.error('無法獲取菜單', error);
      }
    };

    fetchMenu();
  }, []);

  // 處理添加新菜品
  const handleAddDish = async () => {
    try {
      await axios.post('/api/restaurants/menu', newDish);
      setMenuItems([...menuItems, newDish]);
      setNewDish({ name: '', price: 0, description: '' });
    } catch (error) {
      console.error('無法添加新菜品', error);
    }
  };

  return (
    <div>
      <h1>餐廳後台</h1>

      {/* 顯示訂單 */}
      <section>
        <h2>訂單列表</h2>
        <ul>
          {orders.map((order) => (
            <li key={order._id}>
              訂單編號: {order._id} - 狀態: {order.status}
            </li>
          ))}
        </ul>
      </section>

      {/* 顯示菜單 */}
      <section>
        <h2>菜單管理</h2>
        <ul>
          {menuItems.map((dish) => (
            <li key={dish._id}>
              {dish.name} - ${dish.price}
            </li>
          ))}
        </ul>

        {/* 添加新菜品 */}
        <div>
          <h3>新增菜品</h3>
          <input
            type="text"
            placeholder="菜品名稱"
            value={newDish.name}
            onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="價格"
            value={newDish.price}
            onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
          />
          <input
            type="text"
            placeholder="描述"
            value={newDish.description}
            onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
          />
          <button onClick={handleAddDish}>添加</button>
        </div>
      </section>
    </div>
  );
};

export default RestaurantDashboard;
