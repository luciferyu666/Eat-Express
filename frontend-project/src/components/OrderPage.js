import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const OrderPage = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    // 獲取用戶常用地址
    const fetchAddresses = async () => {
      try {
        const data = await api.getUserAddresses(userId);
        setAddresses(data);
      } catch (error) {
        console.error('獲取用戶地址失敗:', error);
      }
    };

    fetchAddresses();
  }, [userId]);

  const handleAddressSelect = (e) => {
    setSelectedAddress(e.target.value);
  };

  return (
    <div>
      <h1>選擇送餐地址</h1>
      <ul>
        {addresses.map((address, index) => (
          <li key={index}>
            <label>
              <input
                type="radio"
                value={address.address}
                checked={selectedAddress === address.address}
                onChange={handleAddressSelect}
              />
              {address.label}: {address.address}
            </label>
          </li>
        ))}
      </ul>
      <button disabled={!selectedAddress}>確認送餐地址</button>
    </div>
  );
};

export default OrderPage;
