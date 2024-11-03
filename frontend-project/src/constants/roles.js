import { storeAuthToken } from "@utils/tokenStorage";
// src/constants/roles.js

/**
 * 用戶角色常量
 *
 * 這個文件從共享模塊導入 USER_ROLES 並重新導出，
 * 以便在應用的其他部分集中管理和使用用戶角色常量。
 *
 * 提供命名導出和默認導出，以兼容現有和新引入的導入方式。
 */

import { USER_ROLES } from '@shared/roles';

/**
 * 命名導出 USER_ROLES
 * 方便在需要的模塊中進行具名導入，提高可讀性和可維護性。
 */
export { USER_ROLES };

/**
 * 默認導出 USER_ROLES
 * 保持與現有的默認導入方式兼容，確保應用的其他部分不受影響。
 */
export default USER_ROLES;
