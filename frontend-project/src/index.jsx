import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import AppProviders from '@context/AppProviders'; // 组合提供者组件，包含 Redux 和多个上下文
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@components/ErrorBoundary'; // 错误边界组件，用于捕获子组件的错误

// 不再使用 dotenv，因为前端环境变量通过构建工具管理

// 获取根 DOM 节点
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  /**
   * React 应用的根渲染
   *
   * @description
   * 此部分负责将 React 应用挂载到 DOM 上，并配置了多个上下文提供者、路由器和错误边界。
   */
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <ErrorBoundary>
          <AppProviders>
            <App />
          </AppProviders>
        </ErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error('根 DOM 节点未找到，无法挂载 React 应用。');
}

// 开始记录应用的性能指标
reportWebVitals();
