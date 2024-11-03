import { storeAuthToken } from "@utils/tokenStorage";
// src/components/common/NotAuthorized.js

import React from 'react';

const NotAuthorized = () => {
  return (
    <div>
      <h1>您没有权限访问此页面。</h1>
    </div>
  );
};

export default NotAuthorized;
