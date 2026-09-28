"use client";

import { useAuth } from "@/context/AuthContext";
import { RoleId } from "@/lib/roles";

export function useRBAC() {
  const { user, loading } = useAuth();

  const hasRole = (role: RoleId) => {
    if (!user) return false;
    return user.role_id === role;
  };

  const hasAnyRole = (roles: RoleId[]) => {
    if (!user) return false;
    return roles.includes(user.role_id as RoleId);
  };

  return {
    user,
    loading,
    hasRole,
    hasAnyRole,
  };
}
