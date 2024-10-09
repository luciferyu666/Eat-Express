// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com', // API 基礎 URL
  timeout: 10000, // 超時設置
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;