// src/components/OrderForm.js
import React, { useState } from 'react';
import axios from 'axios';

const OrderForm = () => {
  const [restaurantId, setRestaurantId] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, price: 0 }]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderStatus, setOrderStatus] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);

  // 計算總價
  const calculateTotalPrice = () => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // 增加菜品
  const addItem = () => {
    setItems([...items, { name: '', quantity: 1, price: 0 }]);
  };

  // 更新菜品數據
  const updateItem = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
    calculateTotalPrice();
  };

  // 提交訂單到後端
  const handleSubmit = async (e) => {
    e.preventDefault();
    const orderData = {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
    };

    try {
      const response = await axios.post('/api/orders/create', orderData);
      setOrderStatus(`訂單創建成功，訂單編號: ${response.data._id}`);
      // 重置表單
      setRestaurantId('');
      setItems([{ name: '', quantity: 1, price: 0 }]);
      setDeliveryAddress('');
      setPaymentMethod('');
      setTotalPrice(0);
    } catch (error) {
      console.error('無法創建訂單', error);
      setOrderStatus('創建訂單失敗');
    }
  };

  return (
    <div>
      <h2>創建訂單</h2>
      {orderStatus && <p>{orderStatus}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>餐廳ID:</label>
          <input
            type="text"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            required
          />
        </div>

        <div>
          <label>送餐地址:</label>
          <input
            type="text"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label>付款方式:</label>
          <input
            type="text"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          />
        </div>

        <div>
          <h3>菜單</h3>
          {items.map((item, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="菜品名稱"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="數量"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="價格"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" onClick={addItem}>添加菜品</button>
        </div>

        <div>
          <h3>總價: ${totalPrice}</h3>
        </div>

        <button type="submit">提交訂單</button>
      </form>
    </div>
  );
};

export default OrderForm;
