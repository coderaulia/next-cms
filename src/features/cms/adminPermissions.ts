import type { AdminPermission, AdminRole } from './types';

const permissionsByRole: Record<AdminRole, AdminPermission[]> = {
  super_admin: [
    'dashboard:view',
    'analytics:view',
    'audit:view',
    'content:edit',
    'content:publish',
    'content:delete',
    'settings:edit',
    'media:edit',
    'taxonomy:edit',
    'team:manage'
  ],
  admin: [
    'dashboard:view',
    'analytics:view',
    'audit:view',
    'content:edit',
    'content:publish',
    'content:delete',
    'settings:edit',
    'media:edit',
    'taxonomy:edit'
  ],
  editor: ['dashboard:view', 'content:edit', 'media:edit'],
  analyst: ['dashboard:view', 'analytics:view', 'audit:view']
};

export function normalizeAdminRole(value: string | null | undefined): AdminRole {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'editor' || normalized === 'analyst') {
    return normalized;
  }
  return 'super_admin';
}

export function permissionsForRole(role: AdminRole): AdminPermission[] {
  return permissionsByRole[role];
}

export function hasAdminPermission(role: AdminRole, permission: AdminPermission) {
  return permissionsByRole[role].includes(permission);
}

export function formatAdminRoleLabel(role: AdminRole) {
  return role.replace(/_/g, ' ');
}
