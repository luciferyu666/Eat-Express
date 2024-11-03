import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/constants/userRoles.js

const USER_ROLES = Object.freeze({
  ADMIN: 'admin',
  DELIVERY_PERSON: 'delivery_person',
  RESTAURANT_OWNER: 'restaurant_owner',
  CUSTOMER: 'customer',
  // 添加其他角色
});

export default USER_ROLES;
