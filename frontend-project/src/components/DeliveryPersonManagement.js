import { storeAuthToken } from "@utils/tokenStorage";
// src/components/DeliveryPersonManagement.js
import React, { useState, useEffect } from 'react';
import axiosInstance from 'axios';

const DeliveryPersonManagement = () => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [editingPerson, setEditingPerson] = useState(null);

  useEffect(() => {
    axiosInstance
      .get("/delivery-person")
      .then((response) => setDeliveryPersons(response.data))
      .catch((error) =>
        console.error('Error fetching delivery persons:', error)
      );
  }, []);

  const handleEdit = (person) => {
    setEditingPerson(person);
  };

  const handleSave = () => {
    axiosInstance
      .put(`/delivery-person/${editingPerson.id}`, editingPerson)
      .then(() => {
        setEditingPerson(null);
        alert('外送員資料已更新');
      })
      .catch((error) =>
        console.error('Error saving delivery person data:', error)
      );
  };

  const handleDisable = (personId) => {
    if (window.confirm('確定禁用此外送員嗎？')) {
      axiosInstance
        .put(`/delivery-person/${personId}/disable`)
        .then(() => {
          setDeliveryPersons(
            deliveryPersons.filter((person) => person.id !== personId)
          );
          alert('外送員已禁用');
        })
        .catch((error) =>
          console.error('Error disabling delivery person:', error)
        );
    }
  };

  return (
    <div>
      <h2>外送員管理</h2>
      <ul>
        {deliveryPersons.map((person) => (
          <li key={person.id}>
            {person.name} - {person.phone}
            <button onClick={() => handleEdit(person)}>編輯</button>
            <button onClick={() => handleDisable(person.id)}>禁用</button>
          </li>
        ))}
      </ul>

      {editingPerson && (
        <div>
          <h3>編輯外送員: {editingPerson.name}</h3>
          <input
            type="text"
            value={editingPerson.name}
            onChange={(e) =>
              setEditingPerson({ ...editingPerson, name: e.target.value })
            }
          />
          <input
            type="text"
            value={editingPerson.phone}
            onChange={(e) =>
              setEditingPerson({ ...editingPerson, phone: e.target.value })
            }
          />
          <button onClick={handleSave}>保存</button>
          <button onClick={() => setEditingPerson(null)}>取消</button>
        </div>
      )}
    </div>
  );
};

export default DeliveryPersonManagement;
