// Mirrors User.USER_ROLE in backend/api/models.py — the API sends these as strings.
export const ROLES = {
  STUDENT: '0',
  TEACHER: '1',
  ADMIN: '2',
  PARENT: '3',
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.TEACHER]: 'Teacher',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PARENT]: 'Parent',
};
