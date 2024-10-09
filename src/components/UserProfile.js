import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../utils/api';

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    addresses: [],
  });
  const [error, setError] = useState('');
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  // 獲取用戶資料
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken'); // 從 localStorage 中獲取 JWT token
        const response = await axios.get('http://localhost:5000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setFormData({
          username: response.data.username,
          email: response.data.email,
          addresses: response.data.addresses,
        });
      } catch (error) {
        console.error('無法獲取用戶資料', error);
        setError('無法加載個人資料');
      }
    };

    fetchUserData();
  }, []);

  // 處理輸入變更
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 處理新地址的輸入
  const handleAddressChange = (e) => {
    setNewAddress({
      ...newAddress,
      [e.target.name]: e.target.value,
    });
  };

  // 新增地址到列表
  const handleAddAddress = () => {
    if (newAddress.label && newAddress.address) {
      setFormData({
        ...formData,
        addresses: [...formData.addresses, newAddress],
      });
      setNewAddress({ label: '', address: '' }); // 清空輸入框
    }
  };

  // 更新用戶資料
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(
        `http://localhost:5000/api/users/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data.user);
      setEditing(false); // 更新後退出編輯模式
      setError('');
    } catch (error) {
      console.error('更新用戶資料失敗', error);
      setError('更新失敗，請檢查輸入');
    }
  };

  return (
    <div>
      <h2>個人資料</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {editing ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>用戶名：</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email：</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <h3>送餐地址</h3>
            <ul>
              {formData.addresses.map((address, index) => (
                <li key={index}>
                  {address.label}: {address.address}
                </li>
              ))}
            </ul>
            <input
              type="text"
              name="label"
              placeholder="地址標籤 (如家庭、公司)"
              value={newAddress.label}
              onChange={handleAddressChange}
            />
            <input
              type="text"
              name="address"
              placeholder="詳細地址"
              value={newAddress.address}
              onChange={handleAddressChange}
            />
            <button type="button" onClick={handleAddAddress}>
              新增地址
            </button>
          </div>
          <button type="submit">保存</button>
          <button type="button" onClick={() => setEditing(false)}>
            取消
          </button>
        </form>
      ) : (
        <div>
          <p>
            <strong>用戶名：</strong> {user.username}
          </p>
          <p>
            <strong>Email：</strong> {user.email}
          </p>
          <h3>送餐地址</h3>
          <ul>
            {user.addresses &&
              user.addresses.map((address, index) => (
                <li key={index}>
                  {address.label}: {address.address}
                </li>
              ))}
          </ul>
          <button onClick={() => setEditing(true)}>編輯</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
