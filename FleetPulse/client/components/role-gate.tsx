"use client";

import React from "react";
import { useRBAC } from "@/hooks/use-rbac";
import { RoleId } from "@/lib/roles";

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: RoleId[];
  fallback?: React.ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { hasAnyRole, loading } = useRBAC();

  if (loading) {
    return null; // Or a subtle loading skeleton if preferred
  }

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
