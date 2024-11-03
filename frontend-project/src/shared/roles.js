// src/shared/roles.js

   // 如果 `storeAuthToken` 在此文件中未被使用，建議移除該導入
   // 如果確實需要，請確保在此文件中有相應的使用邏輯
   // import { storeAuthToken } from "@utils/tokenStorage";

   // 定義並凍結用戶角色對象，防止其被修改
   export const USER_ROLES = Object.freeze({
    ADMIN: 'admin',
    DELIVERY_PERSON: 'delivery_person',
    RESTAURANT_OWNER: 'restaurant_owner',
    CUSTOMER: 'customer',
    // 添加其他角色
  });

  // 默認導出 USER_ROLES
  export default USER_ROLES;