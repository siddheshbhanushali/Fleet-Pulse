"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function PendingPage() {
  const { logout, user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <div className="bg-card border border-border p-8 rounded-2xl shadow-sm max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Account Pending Approval</h1>
        <p className="text-muted-foreground mb-8">
          Welcome, {user?.first_name}! Your account has been successfully created, but it is currently waiting for administrator approval and role assignment.
        </p>
        <div className="text-sm text-muted-foreground mb-8 p-4 bg-muted/50 rounded-lg">
          Please contact your Fleet Manager or System Administrator to activate your account.
        </div>
        <Button onClick={logout} variant="outline" className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}
