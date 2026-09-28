"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useRBAC } from "@/hooks/use-rbac";
import { ROLES, RoleId } from "@/lib/roles";
import { 
  LayoutDashboard, 
  CarFront, 
  Users, 
  Route, 
  Navigation, 
  CalendarDays, 
  Wrench, 
  AlertTriangle, 
  Bell, 
  BarChart3, 
  FileText, 
  Settings,
  Bus,
  Activity,
  ShieldCheck
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/axios";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronUp, LogOut } from "lucide-react";

type NavItem = {
  title: string;
  url: string;
  icon: any;
  allowedRoles: RoleId[];
};

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER, ROLES.FINANCIAL_ANALYST] },
  { title: "Vehicles", url: "/vehicles", icon: CarFront, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] },
  { title: "Drivers", url: "/drivers", icon: Users, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] },
  { title: "Routes", url: "/routes", icon: Route, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] },
  { title: "Trips", url: "/trips", icon: Navigation, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER] },
  { title: "Maintenance", url: "/maintenance", icon: Wrench, allowedRoles: [ROLES.ADMIN, ROLES.FLEET_MANAGER] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, allowedRoles: [ROLES.ADMIN, ROLES.FINANCIAL_ANALYST] },
  { title: "Reports", url: "/reports", icon: FileText, allowedRoles: [ROLES.ADMIN, ROLES.FINANCIAL_ANALYST] },
  { title: "Users", url: "/users", icon: ShieldCheck, allowedRoles: [ROLES.ADMIN] },
  { title: "Settings", url: "/settings", icon: Settings, allowedRoles: [ROLES.ADMIN] },
];

const getRoleName = (roleId?: number) => {
  switch (roleId) {
    case ROLES.ADMIN: return "Admin";
    case ROLES.FLEET_MANAGER: return "Fleet Manager";
    case ROLES.DRIVER: return "Driver";
    case ROLES.FINANCIAL_ANALYST: return "Financial Analyst";
    default: return "";
  }
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const { hasAnyRole } = useRBAC();
  const [isSwitching, setIsSwitching] = useState(false);

  const switchRole = async (email: string) => {
    if (user?.email === email) return;
    setIsSwitching(true);
    const loadingToastId = toast.loading("Switching role...");
    try {
      const response = await api.post("/auth/login", { email, password: "password123" });
      if (response.data.success) {
        login(response.data.token, response.data.user);
        toast.success("Role switched successfully!", { id: loadingToastId });
        window.location.href = "/dashboard"; // hard refresh to update entire app state 
      }
    } catch (error) {
      toast.error("Failed to switch role.", { id: loadingToastId });
    } finally {
      setIsSwitching(false);
    }
  };

  const filteredNavItems = navItems.filter((item) => hasAnyRole(item.allowedRoles));

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex justify-center px-4 border-b border-border/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-xl tracking-tight font-bold bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-300">FleetPulse</span>
        </Link>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1.5">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<Link href={item.url} />} isActive={isActive} tooltip={item.title}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full text-left bg-transparent border-0 p-0 m-0 cursor-pointer outline-none">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-md transition-colors">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" alt={user ? `${user.first_name} ${user.last_name}` : "User"} />
                <AvatarFallback>
                  {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm flex-1">
                <span className="font-semibold text-foreground">
                  {user ? `${user.first_name} ${user.last_name} (${getRoleName(user.role_id)})` : "Loading..."}
                </span>
                <span className="text-xs text-muted-foreground truncate w-[130px]">
                  {user?.email || ""}
                </span>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-[240px]">
            <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">Quick Switch Role</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => switchRole('admin@fleetpulse.io')} disabled={isSwitching} className="cursor-pointer">
              Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager@fleetpulse.io')} disabled={isSwitching} className="cursor-pointer">
              Fleet Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('driver@fleetpulse.io')} disabled={isSwitching} className="cursor-pointer">
              Driver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('analyst@fleetpulse.io')} disabled={isSwitching} className="cursor-pointer">
              Financial Analyst
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
