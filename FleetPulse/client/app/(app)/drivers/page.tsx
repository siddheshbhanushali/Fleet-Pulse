"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { RoleGate } from "@/components/role-gate";
import { ROLES } from "@/lib/roles";

export default function DriversPage() {
  const { user } = useAuth();
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDriver, setSelectedDriver] = React.useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    license_number: "",
    license_category: "",
    license_issue_date: "",
    license_expiry_date: "",
    status: "Available"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/drivers");
      setDrivers(res.data.drivers);
    } catch (error) {
      console.error("Failed to load drivers", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email || undefined,
        phone: formData.phone,
        license_number: formData.license_number,
        license_category: formData.license_category,
        license_issue_date: new Date(formData.license_issue_date).toISOString(),
        license_expiry_date: new Date(formData.license_expiry_date).toISOString(),
        status: formData.status
      };
      
      await api.post("/drivers", payload);
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        license_number: "",
        license_category: "",
        license_issue_date: "",
        license_expiry_date: "",
        status: "Available"
      });
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create driver");
    }
  };

  const handleUpdateStatus = async (driverId: number, status: string) => {
    try {
      await api.put(`/drivers/${driverId}`, { status });
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update driver status");
    }
  };

  const handleDelete = async (driverId: number) => {
    if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) return;
    try {
      await api.delete(`/drivers/${driverId}`);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete driver");
    }
  };

  const handleView = (driver: any) => {
    setSelectedDriver(driver);
    setIsSheetOpen(true);
  };

  const columns = [
    {
      accessorKey: "name",
      header: "Driver Name",
      cell: ({ row }: any) => {
        const first = row.original.first_name;
        const last = row.original.last_name;
        const name = `${first} ${last}`;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary">{first[0]}{last[0]}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "license_number",
      header: "License #",
    },
    {
      accessorKey: "license_category",
      header: "License Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "Available" ? "success" : status === "Suspended" ? "destructive" : status === "Off Duty" ? "secondary" : "default"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const driver = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(driver)}>
                <Eye className="mr-2 h-4 w-4" /> View Profile
              </DropdownMenuItem>
              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(driver.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Deactivate
                </DropdownMenuItem>
              </RoleGate>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Drivers" 
        description="Manage your workforce, track schedules, and review performance."
      >
        <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger className={buttonVariants()}>
              + Add Driver
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Driver</DialogTitle>
                <DialogDescription>
                  Register a new driver to the fleet.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-6 mt-4">
                {formError && (
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input 
                      required 
                      placeholder="e.g. John"
                      value={formData.first_name} 
                      onChange={e => setFormData({...formData, first_name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      required 
                      placeholder="e.g. Doe"
                      value={formData.last_name} 
                      onChange={e => setFormData({...formData, last_name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Optional)</Label>
                    <Input 
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      required
                      placeholder="e.g. +1 234 567 8900"
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Number</Label>
                    <Input 
                      required
                      placeholder="e.g. CDL-123456"
                      value={formData.license_number} 
                      onChange={e => setFormData({...formData, license_number: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Category</Label>
                    <Input 
                      required
                      placeholder="e.g. Class A"
                      value={formData.license_category} 
                      onChange={e => setFormData({...formData, license_category: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Issue Date</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.license_issue_date} 
                      onChange={e => setFormData({...formData, license_issue_date: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>License Expiry Date</Label>
                    <Input 
                      type="date"
                      required
                      value={formData.license_expiry_date} 
                      onChange={e => setFormData({...formData, license_expiry_date: e.target.value})} 
                    />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Driver</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGate>
      </PageHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading drivers data...</div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No drivers found.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={drivers} 
            searchKey="first_name"
            searchPlaceholder="Search drivers by first name..."
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-border p-5">
          <SheetHeader>
            <SheetTitle>Driver Profile</SheetTitle>
            <SheetDescription>
              Details and current status for {selectedDriver?.first_name} {selectedDriver?.last_name}.
            </SheetDescription>
          </SheetHeader>
          {selectedDriver && (
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {selectedDriver.first_name[0]}{selectedDriver.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-lg">{selectedDriver.first_name} {selectedDriver.last_name}</p>
                      <Badge className="px-3 py-1" variant={selectedDriver.status === "Available" ? "success" : selectedDriver.status === "Suspended" ? "destructive" : selectedDriver.status === "Off Duty" ? "secondary" : "default"}>
                        {selectedDriver.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedDriver.license_number}</p>
                  </div>
                </div>
                
                <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    {selectedDriver.status === 'Available' && (
                      <Button onClick={() => handleUpdateStatus(selectedDriver.id, "Off Duty")} variant="outline" className="w-full font-semibold">
                        Mark Off Duty
                      </Button>
                    )}
                    
                    {selectedDriver.status === 'Off Duty' && (
                      <Button onClick={() => handleUpdateStatus(selectedDriver.id, "Available")} className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
                        Mark Available
                      </Button>
                    )}
                    
                    {selectedDriver.status !== 'Suspended' && selectedDriver.status !== 'On Trip' && (
                      <Button onClick={() => handleUpdateStatus(selectedDriver.id, "Suspended")} variant="destructive" className="w-full">
                        Suspend Driver
                      </Button>
                    )}
                  </div>
                </RoleGate>
              </div>

              <div className="bg-muted/10 p-6 rounded-xl border border-border/50 grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="font-semibold">{selectedDriver.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedDriver.email || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">License Category</p>
                  <p className="font-medium">{selectedDriver.license_category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Safety Score</p>
                  <p className="font-medium">⭐ {selectedDriver.safety_score || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                  <p className="font-medium">{new Date(selectedDriver.license_issue_date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">{new Date(selectedDriver.license_expiry_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
