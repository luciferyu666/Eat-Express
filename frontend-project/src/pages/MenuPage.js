import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MenuPage = ({ restaurantId }) => {
  const [menu, setMenu] = useState([]);              // 菜單數據
  const [cart, setCart] = useState([]);              // 購物車
  const [selectedDish, setSelectedDish] = useState(null);  // 選中的菜品
  const [quantity, setQuantity] = useState(1);       // 菜品數量
  const [notes, setNotes] = useState('');            // 備註

  // 獲取指定餐廳的菜單
  useEffect(() => {
    axios.get(`/api/restaurants/${restaurantId}/menu`)
      .then(response => setMenu(response.data))
      .catch(error => console.error('Error fetching menu:', error));
  }, [restaurantId]);

  // 添加菜品到購物車
  const addToCart = (dish) => {
    const updatedCart = [...cart, { ...dish, quantity, notes }];
    setCart(updatedCart);
    setSelectedDish(null);  // 清空當前選中的菜品
    setQuantity(1);         // 重置數量
    setNotes('');           // 重置備註
  };

  // 移除購物車中的菜品
  const removeFromCart = (index) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
  };

  // 修改購物車中菜品數量
  const updateCartQuantity = (index, newQuantity) => {
    const updatedCart = cart.map((item, i) =>
      i === index ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
  };

  return (
    <div className="menu-page">
      <h1>菜單瀏覽</h1>

      {/* 顯示菜單，按類別分組 */}
      {menu.length > 0 ? (
        menu.map(category => (
          <div key={category.name} className="menu-category">
            <h2>{category.name}</h2>
            <ul>
              {category.items.map(dish => (
                <li key={dish.id} className="menu-item">
                  <img src={dish.imageUrl} alt={dish.name} className="menu-item-image" />
                  <div className="menu-item-details">
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                    <p>價格: ${dish.price}</p>
                    <button onClick={() => setSelectedDish(dish)}>加入購物車</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>暫無菜單信息</p>
      )}

      {/* 如果選中了一個菜品，顯示數量和備註設置 */}
      {selectedDish && (
        <div className="menu-item-modal">
          <h3>添加至購物車：{selectedDish.name}</h3>
          <p>價格：${selectedDish.price}</p>
          <div>
            <label>數量：</label>
            <input
              type="number"
              value={quantity}
              min="1"
              onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            />
          </div>
          <div>
            <label>備註：</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：不要辣、加醬等"
            />
          </div>
          <button onClick={() => addToCart(selectedDish)}>確定添加</button>
          <button onClick={() => setSelectedDish(null)}>取消</button>
        </div>
      )}

      {/* 購物車顯示 */}
      <div className="cart">
        <h2>購物車</h2>
        {cart.length > 0 ? (
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <p>{item.name} - {item.quantity} 份</p>
                <p>備註: {item.notes || "無"}</p>
                <p>總價: ${item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(index)}>移除</button>
                <button onClick={() => updateCartQuantity(index, item.quantity + 1)}>增加數量</button>
                {item.quantity > 1 && (
                  <button onClick={() => updateCartQuantity(index, item.quantity - 1)}>減少數量</button>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>購物車為空</p>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
