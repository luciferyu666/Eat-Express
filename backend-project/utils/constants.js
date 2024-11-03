// backend-project/utils/constants.js

/**
 * 用户角色枚举定义
 * 使用 Object.freeze 防止角色常量被修改
 */
const UserRole = Object.freeze({
    ADMIN: 'admin',                     // 系统管理员，拥有最高权限，可以管理所有资源和用户
    DELIVERY_PERSON: 'delivery_person', // 配送人员，负责接收和完成订单配送
    CUSTOMER: 'customer',               // 客户，创建、查看和管理自己的订单
    RESTAURANT_OWNER: 'restaurant_owner', // 餐厅所有者，管理餐厅菜单和订单
    SUPPORT_AGENT: 'support_agent'      // 支持代理，处理客户和配送人员的查询与问题
});

/**
 * ROLES 常量定义
 * ROLES 是 UserRole 的别名，用于更直观的角色授权
 */
const ROLES = UserRole;

/**
 * 角色描述映射
 * 为每个角色提供详细的描述，便于在应用中显示或日志记录
 */
const ROLE_DESCRIPTIONS = {
    [UserRole.ADMIN]: '系统管理员，拥有最高权限，可以管理所有资源和用户',
    [UserRole.DELIVERY_PERSON]: '配送人员，负责接收和完成订单配送',
    [UserRole.CUSTOMER]: '客户，创建、查看和管理自己的订单',
    [UserRole.RESTAURANT_OWNER]: '餐厅所有者，管理餐厅菜单和订单',
    [UserRole.SUPPORT_AGENT]: '支持代理，处理客户和配送人员的查询与问题'
};

/**
 * 角色权限映射（可选）
 * 根据实际需求定义每个角色的权限，便于进行权限控制
 */
const ROLE_PERMISSIONS = {
    [UserRole.ADMIN]: ['manage_users', 'manage_orders', 'view_reports'],
    [UserRole.DELIVERY_PERSON]: ['view_assigned_orders', 'update_order_status'],
    [UserRole.CUSTOMER]: ['create_order', 'view_order_status'],
    [UserRole.RESTAURANT_OWNER]: ['manage_menu', 'view_orders'],
    [UserRole.SUPPORT_AGENT]: ['handle_queries', 'manage_complaints']
};

/**
 * 导出所有常量
 * 其他模块可以通过 require('../utils/constants') 来引入这些常量
 */
module.exports = {
    ROLES,               // 引入统一的角色常量
    UserRole,            // 用户角色枚举
    ROLE_DESCRIPTIONS,   // 角色描述映射
    ROLE_PERMISSIONS     // 角色权限映射
};