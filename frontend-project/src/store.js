// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/userSlice'; // 假設有一個用戶管理的 slice

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
