import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/pages/NotFound.js

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-2xl mb-8">頁面未找到</p>
      <Link to="/" className="text-blue-500 hover:underline">
        返回首頁
      </Link>
    </div>
  );
};

export default NotFound;
