// src/components/RestaurantHomePage/RestaurantInfo.js

import React, { useState } from 'react';

const RestaurantInfo = ({ restaurantData, updateRestaurantData }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ ...restaurantData });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateRestaurantData(formData);
    setEditMode(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">餐廳基本資訊</h2>
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">名稱:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-medium">地址:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-medium">聯繫電話:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block font-medium">營業時間:</label>
            <input
              type="text"
              name="businessHours"
              value={formData.businessHours}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
          <div className="flex space-x-4 mt-4">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">保存</button>
            <button type="button" onClick={() => setEditMode(false)} className="bg-gray-300 px-4 py-2 rounded-md">取消</button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="logo-and-slogan mb-4">
            <img src={restaurantData.logoUrl} alt={`${restaurantData.name} 商標`} className="w-32 h-32" />
            <p className="italic mt-2">{restaurantData.slogan}</p>
          </div>
          <p><strong>名稱:</strong> {restaurantData.name}</p>
          <p><strong>地址:</strong> {restaurantData.address}</p>
          <p><strong>聯繫電話:</strong> {restaurantData.phone}</p>
          <p><strong>營業時間:</strong> {restaurantData.businessHours}</p>
          <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4">編輯</button>
        </div>
      )}
    </div>
  );
};

export default RestaurantInfo;