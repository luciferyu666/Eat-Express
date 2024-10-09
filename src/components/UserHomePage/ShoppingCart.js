// src/components/UserHomePage/ShoppingCart.js

import React from 'react';

const ShoppingCart = ({ cartItems, setCartItems }) => { // 接收 cartItems 和 setCartItems 函數
  const handleCheckout = () => {
    // 將購物車中的項目提交為訂單
    // 例如，調用後端 API 進行訂單創建
  };

  const handleRemoveItem = (id) => {
    // 刪除購物車中的項目
    setCartItems((prevItems) => prevItems.filter(item => item.dish.id !== id));
  };

  return (
    <div className="mt-4 bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-2">購物車</h2>
      {cartItems.length > 0 ? (
        <div>
          <ul>
            {cartItems.map((item) => (
              <li key={item.dish.id} className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-semibold">{item.dish.name}</h3>
                  <p>{`數量: ${item.quantity}`}</p>
                  <p>{`備註: ${item.notes || '無'}`}</p>
                  <p>{`價格: $${item.dish.price * item.quantity}`}</p>
                </div>
                <button 
                  className="text-red-500"
                  onClick={() => handleRemoveItem(item.dish.id)} // 刪除項目
                >
                  刪除
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <p className="font-bold">{`總金額: $${cartItems.reduce((total, item) => total + item.dish.price * item.quantity, 0)}`}</p>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-2"
              onClick={handleCheckout}
            >
              前往支付
            </button>
          </div>
        </div>
      ) : (
        <p>購物車是空的。</p>
      )}
    </div>
  );
};

export default ShoppingCart;
