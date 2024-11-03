import { storeAuthToken } from "@utils/tokenStorage";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RestaurantMenuPage = () => {
  const [menu, setMenu] = useState([]); // 菜單列表
  const [newDish, setNewDish] = useState({
    // 新增菜品信息
    name: '',
    price: '',
    description: '',
    category: '',
    imageUrl: '',
  });
  const [editingDish, setEditingDish] = useState(null); // 編輯中的菜品

  // 獲取餐廳菜單
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get("/menu");
      setMenu(response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  // 添加新菜品
  const handleAddDish = async () => {
    try {
      const response = await axios.post("/menu", newDish);
      setMenu([...menu, response.data]);
      setNewDish({
        name: '',
        price: '',
        description: '',
        category: '',
        imageUrl: '',
      });
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

  // 編輯菜品
  const handleEditDish = async () => {
    try {
      const response = await axios.put(
        `/menu/${editingDish._id}`,
        editingDish
      );
      setMenu(
        menu.map((dish) =>
          dish._id === editingDish._id ? response.data : dish
        )
      );
      setEditingDish(null); // 完成編輯
    } catch (error) {
      console.error('Error editing dish:', error);
    }
  };

  // 刪除菜品
  const handleDeleteDish = async (dishId) => {
    try {
      await axios.delete(`/menu/${dishId}`);
      setMenu(menu.filter((dish) => dish._id !== dishId));
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };

  // 開始編輯菜品
  const startEditingDish = (dish) => {
    setEditingDish(dish);
  };

  return (
    <div className="restaurant-menu-page">
      <h1>菜單管理</h1>

      {/* 新增菜品表單 */}
      <div className="add-dish-form">
        <h2>新增菜品</h2>
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
        <textarea
          placeholder="描述"
          value={newDish.description}
          onChange={(e) =>
            setNewDish({ ...newDish, description: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="類別"
          value={newDish.category}
          onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
        />
        <input
          type="text"
          placeholder="圖片 URL"
          value={newDish.imageUrl}
          onChange={(e) => setNewDish({ ...newDish, imageUrl: e.target.value })}
        />
        <button onClick={handleAddDish}>添加菜品</button>
      </div>

      {/* 菜單列表 */}
      <div className="menu-list">
        <h2>當前菜單</h2>
        <ul>
          {menu.map((dish) => (
            <li key={dish._id}>
              <span>
                {dish.name} - ${dish.price}
              </span>
              <button onClick={() => startEditingDish(dish)}>編輯</button>
              <button onClick={() => handleDeleteDish(dish._id)}>刪除</button>
            </li>
          ))}
        </ul>
      </div>

      {/* 編輯菜品表單 */}
      {editingDish && (
        <div className="edit-dish-form">
          <h2>編輯菜品</h2>
          <input
            type="text"
            placeholder="菜品名稱"
            value={editingDish.name}
            onChange={(e) =>
              setEditingDish({ ...editingDish, name: e.target.value })
            }
          />
          <input
            type="number"
            placeholder="價格"
            value={editingDish.price}
            onChange={(e) =>
              setEditingDish({ ...editingDish, price: e.target.value })
            }
          />
          <textarea
            placeholder="描述"
            value={editingDish.description}
            onChange={(e) =>
              setEditingDish({ ...editingDish, description: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="類別"
            value={editingDish.category}
            onChange={(e) =>
              setEditingDish({ ...editingDish, category: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="圖片 URL"
            value={editingDish.imageUrl}
            onChange={(e) =>
              setEditingDish({ ...editingDish, imageUrl: e.target.value })
            }
          />
          <button onClick={handleEditDish}>保存修改</button>
        </div>
      )}
    </div>
  );
};

export default RestaurantMenuPage;
