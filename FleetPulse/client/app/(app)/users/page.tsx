"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/axios";

export default function UsersPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId: number, field: string, value: any) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      if (!userToUpdate) return;
      
      const payload = {
        role_id: field === 'role_id' ? parseInt(value) : userToUpdate.role_id,
        is_active: field === 'is_active' ? value : userToUpdate.is_active,
      };

      await api.put(`/users/${userId}`, payload);
      
      // Update local state without fetching all again
      setUsers(users.map(u => u.id === userId ? { ...u, ...payload, roles: { name: getRoleName(payload.role_id) } } : u));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update user");
      fetchUsers(); // Revert on failure
    }
  };

  const getRoleName = (id: number) => {
    const roles: Record<number, string> = {
      1: "Admin",
      2: "Fleet Manager",
      3: "Driver",
      4: "Financial Analyst"
    };
    return roles[id] || "Unknown";
  };

  const columns = [
    {
      accessorKey: "first_name",
      header: "Name",
      cell: ({ row }: any) => <div className="font-medium">{row.original.first_name} {row.original.last_name}</div>,
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => <div>{row.getValue("phone") || "N/A"}</div>,
    },
    {
      accessorKey: "role_id",
      header: "Role",
      cell: ({ row }: any) => {
        const user = row.original;
        return (
          <Select 
            value={user.role_id.toString()} 
            onValueChange={(val) => handleUpdateUser(user.id, 'role_id', val)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="2">Fleet Manager</SelectItem>
              <SelectItem value="3">Driver</SelectItem>
              <SelectItem value="4">Financial Analyst</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Active Status",
      cell: ({ row }: any) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              checked={user.is_active} 
              onCheckedChange={(val) => handleUpdateUser(user.id, 'is_active', val)}
            />
            <Badge variant={user.is_active ? "success" : "secondary"}>
              {user.is_active ? "Active" : "Pending"}
            </Badge>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="User Management" 
        description="Onboard new signups, manage active users, and assign roles."
      />
      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="email"
            searchPlaceholder="Search users by email..."
          />
        )}
      </div>
    </div>
  );
}
