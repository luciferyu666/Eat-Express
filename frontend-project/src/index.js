// frontend-project/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // 引入 Tailwind CSS 和其他全局樣式
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import setupAxiosInterceptors from './setupAxios'; // 引入 Axios 拦截器设置
import UserProvider from './context/UserContext'; // 引入 UserProvider

// 初始化 Axios 拦截器
setupAxiosInterceptors();

// 將 Redux 的 store 注入到 React 應用中
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <UserProvider> {/* 添加 UserProvider */}
        <App /> {/* 保持 App 在 UserProvider 內部 */}
      </UserProvider>
    </Provider>
  </React.StrictMode>,
);

// 如果想要測量應用的性能，可以將結果記錄到分析終端或控制台
// Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
