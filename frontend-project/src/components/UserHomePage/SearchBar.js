import { storeAuthToken } from "@utils/tokenStorage";
// src/components/UserHomePage/SearchBar.js

import React, { useState, useEffect } from 'react';
import axios from '@utils/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchType, setSearchType] = useState('restaurant'); // 'restaurant' 或 'dish'

  useEffect(() => {
    if (query.length > 2) {
      axios
        .get('/search', {
          params: {
            type: searchType,
            q: query,
          },
        })
        .then((response) => setSearchResults(response.data))
        .catch((error) => console.error('搜索失敗:', error));
    } else {
      setSearchResults([]);
    }
  }, [query, searchType]);

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-2">搜索餐廳或菜品</h2>
      <div className="flex mb-2">
        <input
          type="text"
          placeholder="輸入關鍵字..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow border rounded-l px-3 py-2 focus:outline-none"
        />
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border-t border-b border-r rounded-r px-3 py-2 focus:outline-none"
        >
          <option value="restaurant">餐廳</option>
          <option value="dish">菜品</option>
        </select>
      </div>
      {searchResults.length > 0 && (
        <ul className="border rounded max-h-60 overflow-y-auto">
          {searchResults.map((item) => (
            <li key={item.id} className="p-2 hover:bg-gray-100 cursor-pointer">
              {searchType === 'restaurant' ? item.name : item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
