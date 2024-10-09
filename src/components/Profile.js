// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    contact: '',
    workArea: '',
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // 從後端獲取個人資料
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/delivery/profile');
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // 使用默認或模擬數據
        setProfile({
          name: '張三',
          contact: '0987-654-321',
          workArea: '台北市',
        });
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.put('http://localhost:5000/api/delivery/profile', profile);
      setIsEditing(false);
      // 可以顯示保存成功的提示
    } catch (error) {
      console.error('Error updating profile:', error);
      // 可以顯示錯誤提示
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-8 w-full max-w-3xl">
      <h2 className="text-2xl font-semibold text-gray-800">個人資料</h2>
      <div className="mt-4">
        <label className="block text-gray-700">姓名：</label>
        {isEditing ? (
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="mt-1 p-2 border rounded w-full"
          />
        ) : (
          <p className="text-gray-600">{profile.name}</p>
        )}
      </div>
      <div className="mt-4">
        <label className="block text-gray-700">聯繫方式：</label>
        {isEditing ? (
          <input
            type="text"
            name="contact"
            value={profile.contact}
            onChange={handleChange}
            className="mt-1 p-2 border rounded w-full"
          />
        ) : (
          <p className="text-gray-600">{profile.contact}</p>
        )}
      </div>
      <div className="mt-4">
        <label className="block text-gray-700">工作區域：</label>
        {isEditing ? (
          <input
            type="text"
            name="workArea"
            value={profile.workArea}
            onChange={handleChange}
            className="mt-1 p-2 border rounded w-full"
          />
        ) : (
          <p className="text-gray-600">{profile.workArea}</p>
        )}
      </div>
      <div className="mt-6">
        {isEditing ? (
          <>
            <button
              className="px-5 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition ease-in-out mr-4"
              onClick={handleSave}
            >
              保存
            </button>
            <button
              className="px-5 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition ease-in-out"
              onClick={() => setIsEditing(false)}
            >
              取消
            </button>
          </>
        ) : (
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition ease-in-out"
            onClick={() => setIsEditing(true)}
          >
            編輯
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;