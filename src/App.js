// frontend-project/src/App.js (原始代碼 )


import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';                        // 更新后的首页组件
import UserLogin from './components/UserLogin';                  // 用户登录页面
import UserRegister from './components/UserRegister';            // 用户注册页面
import RestaurantLogin from './components/RestaurantLogin';      // 餐厅登录页面
import RestaurantRegister from './components/RestaurantRegister';// 餐厅注册页面
import DeliveryLogin from './components/DeliveryLogin';          // 外送员登录页面
import DeliveryRegister from './components/DeliveryRegister';    // 外送员注册页面
import DeliveryHomePage from './pages/DeliveryHomePage';        // 外送员首页
import AdminLogin from './components/AdminLogin';                // 管理员登录页面
import AdminRegister from './components/AdminRegister';          // 管理员注册页面
import AdminHomePage from './pages/AdminHomePage';              // 管理员首页
import UserHomePage from './pages/UserHomePage';                // 用户首页
import RestaurantHomePage from './pages/RestaurantHomePage';    // 餐厅首页
import ProtectedRoute from './components/ProtectedRoute';        // 受保护路由
import NotFound from './pages/NotFound';                        // 404 页面
import ErrorBoundary from './components/ErrorBoundary';          // 引入错误边界组件
import { connectSocket } from './socket';                        // 引入 Socket 连接函数
import NavigationBar from './components/NavigationBar';          // 引入新的导航栏组件
import AdminNavigation from './components/AdminNavigation';      // 引入管理员导航组件


function App() {
  useEffect(() => {
    connectSocket(); // 在应用启动时初始化 Socket 连接
  }, []);


  const token = localStorage.getItem('authToken'); // 获取 token
  const role = localStorage.getItem('role');        // 获取角色


  // 添加调试日志，检查角色
  console.log('App rendered with role:', role); // 添加这行日志


  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* 根据角色选择不同的导航组件 */}
        {role === 'admin' ? <AdminNavigation /> : <NavigationBar />}


        {/* 使用 Tailwind CSS 进行 Header 样式 */}
        <header className="bg-gray-800 p-4">
          <h1 className="text-white text-2xl">Food Delivery 平台</h1>
          <p className="text-white">欢迎使用，我们将根据您的角色提供最佳服务！</p>
        </header>


        <main className="flex-grow">
          <ErrorBoundary>
            {/* 路由配置 */}
            <Routes>
              {/* 根据角色导航至不同的首页 */}
              <Route
                path="/"
                element={
                  token && role === 'restaurant'
                    ? <Navigate to="/restaurants/home" replace />
                    : token && role === 'delivery_person'
                      ? <Navigate to="/delivery/home" replace />
                      : token && role === 'customer'
                        ? <Navigate to="/user/home" replace />
                        : token && role === 'admin'
                          ? <Navigate to="/admin/home" replace />
                          : <HomePage />
                }
              />


              {/* 用户登录和注册路由 */}
              <Route path="/user/login" element={<UserLogin />} />
              <Route path="/user/register" element={<UserRegister />} />


              {/* 用户首页，仅用户角色可访问 */}
              <Route
                path="/user/home"
                element={
                  <ProtectedRoute role="customer">
                    <UserHomePage />
                  </ProtectedRoute>
                }
              />


              {/* 餐厅登录和注册路由 */}
              <Route path="/restaurants/login" element={<RestaurantLogin />} />
              <Route path="/restaurants/register" element={<RestaurantRegister />} />


              {/* 餐厅首页，仅餐厅角色可访问 */}
              <Route
                path="/restaurants/home"
                element={
                  <ProtectedRoute role="restaurant">
                    <RestaurantHomePage />
                  </ProtectedRoute>
                }
              />


              {/* 外送员登录和注册路由 */}
              <Route path="/delivery/login" element={<DeliveryLogin />} />
              <Route path="/delivery/register" element={<DeliveryRegister />} />


              {/* 外送员首页，仅外送员角色可访问 */}
              <Route
                path="/delivery/home"
                element={
                  <ProtectedRoute role="delivery_person">
                    <DeliveryHomePage />
                  </ProtectedRoute>
                }
              />


              {/* 管理员登录和注册路由 */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />


              {/* 管理员首页，仅管理员角色可访问 */}
              <Route
                path="/admin/home"
                element={
                  <ProtectedRoute role="admin">
                    <AdminHomePage />
                  </ProtectedRoute>
                }
              />


              {/* 404 页面 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}


export default App;