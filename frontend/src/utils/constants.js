export const ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  ADMIN: 'admin',
};

export const WORK_STATUS = {
  COMPLETED: 'completed',
  INCOMPLETE: 'incomplete',
  IN_PROGRESS: 'in-progress',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VALID: 'valid',
  INVALID: 'invalid',
};

export const OVERTIME_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

export const ROLE_HOME_PATH = {
  [ROLES.EMPLOYEE]: '/employee/dashboard',
  [ROLES.MANAGER]: '/manager/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard',
};

// Sidebar nav items are generated from this map rather than hardcoded per layout.
export const NAV_CONFIG = {
  [ROLES.EMPLOYEE]: [
    { label: 'Dashboard', to: '/employee/dashboard' },
    { label: 'Punch In/Out', to: '/employee/punch' },
    { label: 'My Attendance', to: '/employee/attendance' },
    { label: 'My Overtime', to: '/employee/overtime' },
    { label: 'Reports', to: '/reports' },
    { label: 'Profile', to: '/profile' },
  ],
  [ROLES.MANAGER]: [
    { label: 'Dashboard', to: '/manager/dashboard' },
    { label: 'Team Attendance', to: '/manager/attendance' },
    { label: 'Verify Attendance', to: '/manager/verify' },
    { label: 'Overtime Approvals', to: '/manager/overtime' },
    { label: 'Reports', to: '/reports' },
    { label: 'Profile', to: '/profile' },
  ],
  [ROLES.ADMIN]: [
    { label: 'Dashboard', to: '/admin/dashboard' },
    { label: 'All Users', to: '/admin/users' },
    { label: 'All Attendance', to: '/admin/attendance' },
    { label: 'System Reports', to: '/admin/reports' },
    { label: 'Profile', to: '/profile' },
  ],
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Attendance Management System';
