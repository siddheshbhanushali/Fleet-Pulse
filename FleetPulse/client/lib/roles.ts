export const ROLES = {
  ADMIN: 1,
  FLEET_MANAGER: 2,
  DRIVER: 3,
  FINANCIAL_ANALYST: 4,
} as const;

export type RoleId = typeof ROLES[keyof typeof ROLES];
