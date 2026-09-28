"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Eye, Plus } from "lucide-react";
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
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGate } from "@/components/role-gate";
import { ROLES } from "@/lib/roles";
import { useAuth } from "@/context/AuthContext";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export default function MaintenancePage() {
  const { user } = useAuth();
  const [logs, setLogs] = React.useState<any[]>([]);
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedLog, setSelectedLog] = React.useState<any | null>(null);
  
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    vehicle_id: "",
    maintenance_type: "",
    service_center: "",
    maintenance_date: "",
    cost: "",
    status: "Scheduled",
    description: ""
  });

  const [completeData, setCompleteData] = React.useState({
    completion_date: "",
    final_cost: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, vehiclesRes] = await Promise.all([
        api.get("/maintenance"),
        api.get("/vehicles") // Get all vehicles to allow creating records for active/maintenance vehicles
      ]);
      setLogs(logsRes.data.maintenance_logs || []);
      setVehicles(vehiclesRes.data.vehicles || []);
    } catch (error) {
      console.error("Failed to load data:", error);
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
        ...formData,
        vehicle_id: parseInt(formData.vehicle_id),
        cost: parseFloat(formData.cost),
        maintenance_date: new Date(formData.maintenance_date).toISOString()
      };
      
      await api.post("/maintenance", payload);
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        vehicle_id: "",
        maintenance_type: "",
        service_center: "",
        maintenance_date: "",
        cost: "",
        status: "Scheduled",
        description: ""
      });
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create maintenance log");
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLog) return;
    try {
      await api.post(`/maintenance/${selectedLog.id}/complete`, {
        completion_date: new Date(completeData.completion_date).toISOString(),
        cost: completeData.final_cost ? parseFloat(completeData.final_cost) : selectedLog.cost
      });
      setIsCompleteModalOpen(false);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to complete maintenance");
    }
  };

  const handleView = (log: any) => {
    setSelectedLog(log);
    setCompleteData({
      completion_date: new Date().toISOString().split('T')[0],
      final_cost: log.cost
    });
    setIsSheetOpen(true);
  };

  const columns = [
    {
      accessorKey: "id",
      header: "Log ID",
      cell: ({ row }: any) => <div className="font-medium">MNT-{row.getValue("id")}</div>,
    },
    {
      id: "vehicle",
      header: "Vehicle",
      cell: ({ row }: any) => {
        const v = row.original.vehicles;
        return v ? `${v.vehicle_name} (${v.registration_number})` : "N/A";
      }
    },
    {
      accessorKey: "maintenance_type",
      header: "Type",
    },
    {
      accessorKey: "maintenance_date",
      header: "Scheduled Date",
      cell: ({ row }: any) => formatDate(row.getValue("maintenance_date")),
    },
    {
      accessorKey: "cost",
      header: "Cost",
      cell: ({ row }: any) => `₹${row.getValue("cost")}`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "Completed" ? "success" : status === "In Progress" ? "default" : status === "Scheduled" ? "secondary" : "warning"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const log = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(log)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Maintenance" 
        description="Schedule repairs, track service history, and monitor fleet health."
      >
        <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger className={buttonVariants({ variant: "default" }) + " gap-2"}>
              <Plus className="h-4 w-4" />
              New Record
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add Maintenance Record</DialogTitle>
                <DialogDescription>
                  Schedule maintenance or record a past service.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
                {formError && (
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle</Label>
                    <Select value={formData.vehicle_id} onValueChange={v => setFormData({...formData, vehicle_id: v as string})} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select vehicle">
                          {formData.vehicle_id 
                            ? (() => {
                                const v = vehicles.find(x => x.id.toString() === formData.vehicle_id);
                                return v ? `${v.vehicle_name} (${v.registration_number})` : "Select vehicle";
                              })()
                            : "Select vehicle"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.filter(v => v.status !== "Retired").map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.vehicle_name} ({v.registration_number})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v as string})} required>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maintenance Type</Label>
                    <Input required placeholder="E.g. Oil Change, Repair" value={formData.maintenance_type} onChange={e => setFormData({...formData, maintenance_type: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Service Center / Mechanic</Label>
                    <Input placeholder="E.g. AutoFix Shop" value={formData.service_center} onChange={e => setFormData({...formData, service_center: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Scheduled Date</Label>
                    <Input type="date" required value={formData.maintenance_date} onChange={e => setFormData({...formData, maintenance_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estimated Cost (₹)</Label>
                    <Input type="number" step="0.01" required placeholder="0.00" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Details about the maintenance..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Record</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGate>
      </PageHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading maintenance records...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No maintenance records found.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={logs} 
            searchKey="maintenance_type"
            searchPlaceholder="Search by maintenance type..."
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-border p-5">
          <SheetHeader>
            <SheetTitle>Maintenance Details</SheetTitle>
            <SheetDescription>
              Record ID: MNT-{selectedLog?.id}
            </SheetDescription>
          </SheetHeader>
          {selectedLog && (
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="font-semibold text-lg">{selectedLog.status}</p>
                  </div>
                  <Badge className="px-3 py-1" variant={selectedLog.status === "Completed" ? "success" : selectedLog.status === "In Progress" ? "default" : selectedLog.status === "Scheduled" ? "secondary" : "warning"}>
                    {selectedLog.status}
                  </Badge>
                </div>
                
                <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                  {(selectedLog.status === 'Scheduled' || selectedLog.status === 'In Progress') && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                      <Button onClick={() => setIsCompleteModalOpen(true)} className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
                        Mark as Completed
                      </Button>
                      
                    </div>
                  )}
                </RoleGate>
              </div>

              <div className="bg-muted/10 p-6 rounded-xl border border-border/50 grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{selectedLog.vehicles ? `${selectedLog.vehicles.vehicle_name} (${selectedLog.vehicles.registration_number})` : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedLog.maintenance_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Service Center</p>
                  <p className="font-medium">{selectedLog.service_center || 'Internal'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Cost</p>
                  <p className="font-medium">₹{selectedLog.cost}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                  <p className="font-medium">{formatDate(selectedLog.maintenance_date)}</p>
                </div>
                {selectedLog.status === 'Completed' && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Completion Date</p>
                    <p className="font-medium">{formatDate(selectedLog.completion_date)}</p>
                  </div>
                )}
                {selectedLog.description && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="font-medium text-sm">{selectedLog.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Maintenance</DialogTitle>
            <DialogDescription>
              Confirm completion date and final cost.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Completion Date</Label>
              <Input 
                type="date" 
                required 
                value={completeData.completion_date} 
                onChange={e => setCompleteData({...completeData, completion_date: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Final Cost (₹)</Label>
              <Input 
                type="number" 
                step="0.01" 
                required 
                value={completeData.final_cost} 
                onChange={e => setCompleteData({...completeData, final_cost: e.target.value})} 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Complete Maintenance</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
