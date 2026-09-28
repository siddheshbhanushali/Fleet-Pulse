import * as React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopNavbar } from "@/components/top-navbar";
import { CentralRoleGuard } from "@/components/central-role-guard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex min-h-screen w-full flex-col bg-muted/20">
        <TopNavbar />
        <main className="flex-1 overflow-x-hidden p-6 max-w-[1600px] w-full mx-auto">
          <CentralRoleGuard>
            {children}
          </CentralRoleGuard>
        </main>
      </div>
    </SidebarProvider>
  );
}
