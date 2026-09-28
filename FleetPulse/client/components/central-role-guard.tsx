"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRBAC } from "@/hooks/use-rbac";
import { ROLES, RoleId } from "@/lib/roles";

const routePermissions: Record<string, RoleId[]> = {
  "/dashboard": [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.FINANCIAL_ANALYST],
  "/vehicles": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/drivers": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/routes": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/trips": [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER],
  "/schedules": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/maintenance": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/incidents": [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER],
  "/alerts": [ROLES.ADMIN, ROLES.FLEET_MANAGER],
  "/analytics": [ROLES.ADMIN, ROLES.FINANCIAL_ANALYST],
  "/reports": [ROLES.ADMIN, ROLES.FINANCIAL_ANALYST],
  "/settings": [ROLES.ADMIN],
  "/users": [ROLES.ADMIN],
};

export function CentralRoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { hasAnyRole, loading: rbacLoading } = useRBAC();
  const { user, loading: authLoading } = useAuth();
  const loading = rbacLoading || authLoading;

  const requiredRoles = useMemo(() => {
    // Match exact path or subpath
    for (const route of Object.keys(routePermissions)) {
      if (pathname === route || pathname.startsWith(`${route}/`)) {
        return routePermissions[route];
      }
    }
    return null;
  }, [pathname]);

  useEffect(() => {
    if (!loading && user) {
      if ((user as any).is_active === false && pathname !== '/pending') {
        router.replace("/pending");
        return;
      }

      if (requiredRoles && !hasAnyRole(requiredRoles)) {
        router.replace("/dashboard");
      }
    }
  }, [loading, user, hasAnyRole, requiredRoles, router, pathname]);

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-black dark:border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || ((user as any).is_active === false && pathname !== '/pending')) {
    return null;
  }

  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return null; 
  }

  return <>{children}</>;
}
