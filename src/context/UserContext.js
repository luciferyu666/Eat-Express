// frontend-project/src/context/UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // 使用命名匯入

export const UserContext = createContext(); // 命名匯出 UserContext

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    console.log('UserProvider: Retrieved token from localStorage:', token); // 添加日志
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('UserProvider: Decoded Token:', decodedToken); // 添加日志
        setUser({
          userId: decodedToken.userId,
          role: decodedToken.role,
          // 如果有其他欄位，如 restaurantId，deliveryId 等，添加在這裡
        });
        console.log('UserProvider: User set to:', {
          userId: decodedToken.userId,
          role: decodedToken.role,
        }); // 添加日志
      } catch (error) {
        console.error('UserProvider: Invalid token', error);
        setUser(null);
        // navigate('/user/login'); // 暫時移除導航
      }
    }
  }, []); // 移除 navigate 依賴

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider };
export default UserProvider;
