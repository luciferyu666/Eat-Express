import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/components/ProtectedRoute.js

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { AuthContext } from '@context/AuthContext'; // 引入 AuthContext

/**
 * ProtectedRoute 组件用于保护需要特定角色访问的路由
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 需要渲染的子组件
 * @param {string|string[]} [props.roles] - 允许访问的用户角色（单个角色或角色数组）
 * @returns {React.ReactNode} 渲染的子组件或重定向
 */
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // 如果用户未登录，重定向到登录页面，并保存当前路径以便登录后返回
  if (!user || !user.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果指定了角色，检查用户角色是否匹配
  if (roles) {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/not-authorized" replace />;
    }
  }

  // 用户已通过验证，渲染子组件
  return children;
};

// 类型检查
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

// 默认属性
ProtectedRoute.defaultProps = {
  roles: null,
};

export default ProtectedRoute;
