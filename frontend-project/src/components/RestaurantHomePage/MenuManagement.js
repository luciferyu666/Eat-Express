import { storeAuthToken } from "@utils/tokenStorage";
// src/components/RestaurantHomePage/MenuManagement.js

import React, { useEffect, useState } from 'react';
import api from '@utils/api';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: '',
  });

  useEffect(() => {
    // 獲取菜品分類
    api
      .get('/restaurant/menu/categories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('獲取菜品分類失敗:', error));
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      // 獲取選定分類的菜品
      api
        .get(`/restaurant/menu/categories/${selectedCategory}/dishes`)
        .then((response) => setDishes(response.data))
        .catch((error) => console.error('獲取菜品失敗:', error));
    }
  }, [selectedCategory]);

  const handleAddDish = () => {
    const { name, description, price, image, categoryId } = newDish;
    if (!name || !description || !price || !categoryId) {
      alert('請填寫所有必填項。');
      return;
    }

    api
      .post('/restaurant/menu/dishes', newDish)
      .then((response) => {
        setDishes([...dishes, response.data]);
        setNewDish({
          name: '',
          description: '',
          price: '',
          image: '',
          categoryId: '',
        });
      })
      .catch((error) => console.error('添加菜品失敗:', error));
  };

  const handleDeleteDish = (dishId) => {
    api
      .delete(`/restaurant/menu/dishes/${dishId}`)
      .then(() => {
        setDishes(dishes.filter((dish) => dish.id !== dishId));
      })
      .catch((error) => console.error('刪除菜品失敗:', error));
  };

  const handleEditDish = (dishId, updatedDish) => {
    api
      .put(`/restaurant/menu/dishes/${dishId}`, updatedDish)
      .then((response) => {
        setDishes(
          dishes.map((dish) => (dish.id === dishId ? response.data : dish))
        );
      })
      .catch((error) => console.error('編輯菜品失敗:', error));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">菜單管理</h2>
      <div className="flex flex-col md:flex-row">
        {/* 分類列表 */}
        <div className="md:w-1/4 mr-4">
          <h3 className="text-lg font-semibold mb-2">菜品分類</h3>
          <ul className="max-h-64 overflow-y-auto">
            {categories.map((category) => (
              <li
                key={category.id}
                className={`p-2 cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-blue-100'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        </div>

        {/* 菜品列表 */}
        <div className="md:w-3/4">
          {selectedCategory ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">菜品列表</h3>
              <ul className="space-y-4">
                {dishes.map((dish) => (
                  <li
                    key={dish.id}
                    className="border rounded p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{dish.name}</p>
                      <p>{dish.description}</p>
                      <p className="font-bold">${dish.price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                        onClick={() => {
                          // 處理編輯菜品的邏輯
                          const updatedName = prompt(
                            '請輸入新的菜品名稱:',
                            dish.name
                          );
                          if (updatedName) {
                            handleEditDish(dish.id, {
                              ...dish,
                              name: updatedName,
                            });
                          }
                        }}
                      >
                        編輯
                      </button>
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded"
                        onClick={() => handleDeleteDish(dish.id)}
                      >
                        刪除
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* 添加新菜品 */}
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-2">添加新菜品</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="菜品名稱"
                    value={newDish.name}
                    onChange={(e) =>
                      setNewDish({ ...newDish, name: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                  <textarea
                    placeholder="菜品描述"
                    value={newDish.description}
                    onChange={(e) =>
                      setNewDish({ ...newDish, description: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                  <input
                    type="number"
                    placeholder="價格"
                    value={newDish.price}
                    onChange={(e) =>
                      setNewDish({ ...newDish, price: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                  <input
                    type="text"
                    placeholder="圖片URL"
                    value={newDish.image}
                    onChange={(e) =>
                      setNewDish({ ...newDish, image: e.target.value })
                    }
                    className="border rounded px-2 py-1 w-full"
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={handleAddDish}
                  >
                    添加菜品
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>請選擇一個分類以查看菜品。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
