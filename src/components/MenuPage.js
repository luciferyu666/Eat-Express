// src/components/MenuPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MenuPage = ({ restaurantId }) => {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`/api/restaurants/${restaurantId}/menu`);
        setMenu(data);
      } catch (error) {
        console.error('Error fetching menu:', error);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  const addToCart = (dish) => {
    setCart([...cart, dish]);
  };

  return (
    <div className="menu-page">
      <h1>菜單</h1>
      <div>
        {menu.map((dish) => (
          <div key={dish.id}>
            <h3>{dish.name}</h3>
            <p>{dish.description}</p>
            <button onClick={() => addToCart(dish)}>添加至購物車</button>
          </div>
        ))}
      </div>
      <h2>購物車</h2>
      <ul>
        {cart.map((item, index) => (
          <li key={index}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default MenuPage;