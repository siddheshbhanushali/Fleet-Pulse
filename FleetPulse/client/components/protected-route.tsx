"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRBAC } from "@/hooks/use-rbac";
import { RoleId } from "@/lib/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: RoleId[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { hasAnyRole, loading } = useRBAC();

  useEffect(() => {
    if (!loading && !hasAnyRole(allowedRoles)) {
      router.replace("/dashboard");
    }
  }, [loading, hasAnyRole, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-10">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!hasAnyRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}
