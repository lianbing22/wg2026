/**
 * 定义用户认证、角色和权限相关的类型
 */

/** 用户角色 */
export type UserRole = 'admin' | 'manager' | 'staff' | 'tenant' | 'guest';

/** 用户权限 */
export interface UserPermissions {
  canViewDashboard: boolean;
  canManageProperties: boolean;
  canManageUsers: boolean;
  canAccessFinancials: boolean;
  canManageStaff: boolean;
  canManageTenants: boolean;
  canEditScenarios: boolean;
  canPlayGame: boolean;
}

/** 用户信息接口 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
}