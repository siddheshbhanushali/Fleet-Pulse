"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
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

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedVehicle, setSelectedVehicle] = React.useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    registration_number: "",
    vehicle_name: "",
    model: "",
    manufacturer: "",
    manufacture_year: "",
    vehicle_type: "",
    max_load_capacity: "",
    fuel_type: "",
    status: "Available"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vehicles");
      setVehicles(res.data.vehicles);
    } catch (error) {
      console.error("Failed to load vehicles", error);
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
        registration_number: formData.registration_number,
        vehicle_name: formData.vehicle_name,
        model: formData.model || undefined,
        manufacturer: formData.manufacturer || undefined,
        manufacture_year: formData.manufacture_year ? parseInt(formData.manufacture_year) : undefined,
        vehicle_type: formData.vehicle_type,
        max_load_capacity: parseFloat(formData.max_load_capacity),
        fuel_type: formData.fuel_type || undefined,
        status: formData.status
      };
      
      await api.post("/vehicles", payload);
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        registration_number: "",
        vehicle_name: "",
        model: "",
        manufacturer: "",
        manufacture_year: "",
        vehicle_type: "",
        max_load_capacity: "",
        fuel_type: "",
        status: "Available"
      });
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create vehicle");
    }
  };

  const handleUpdateStatus = async (vehicleId: number, status: string) => {
    try {
      await api.put(`/vehicles/${vehicleId}`, { status });
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update vehicle status");
    }
  };

  const handleDelete = async (vehicleId: number) => {
    if (!confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) return;
    try {
      await api.delete(`/vehicles/${vehicleId}`);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete vehicle");
    }
  };

  const handleView = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setIsSheetOpen(true);
  };

  const columns = [
    {
      accessorKey: "registration_number",
      header: "Registration",
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("registration_number")}</div>,
    },
    {
      accessorKey: "vehicle_name",
      header: "Name",
    },
    {
      accessorKey: "vehicle_type",
      header: "Type",
    },
    {
      accessorKey: "fuel_type",
      header: "Fuel Type",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "Available" ? "success" : status === "In Shop" ? "destructive" : status === "Retired" ? "secondary" : "default"}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "current_odometer",
      header: "Odometer",
      cell: ({ row }: any) => `${row.getValue("current_odometer") || 0} km`,
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const vehicle = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(vehicle)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
        title="Vehicles" 
        description="Manage your fleet, track statuses, and schedule maintenance."
      >
        <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger className={buttonVariants()}>
              + Add Vehicle
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
                <DialogDescription>
                  Register a new vehicle in the fleet.
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
                    <Label>Registration Number</Label>
                    <Input 
                      required 
                      placeholder="e.g. MH-12-AB-1234"
                      value={formData.registration_number} 
                      onChange={e => setFormData({...formData, registration_number: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Name/Alias</Label>
                    <Input 
                      required 
                      placeholder="e.g. Delivery Van 1"
                      value={formData.vehicle_name} 
                      onChange={e => setFormData({...formData, vehicle_name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Input 
                      required 
                      placeholder="e.g. Truck, Van, Bus"
                      value={formData.vehicle_type} 
                      onChange={e => setFormData({...formData, vehicle_type: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Load Capacity (kg)</Label>
                    <Input 
                      type="number"
                      step="0.1"
                      required 
                      placeholder="e.g. 2000"
                      value={formData.max_load_capacity} 
                      onChange={e => setFormData({...formData, max_load_capacity: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Model (Optional)</Label>
                    <Input 
                      placeholder="e.g. Transit"
                      value={formData.model} 
                      onChange={e => setFormData({...formData, model: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacturer (Optional)</Label>
                    <Input 
                      placeholder="e.g. Ford"
                      value={formData.manufacturer} 
                      onChange={e => setFormData({...formData, manufacturer: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Manufacture Year (Optional)</Label>
                    <Input 
                      type="number"
                      placeholder="e.g. 2021"
                      value={formData.manufacture_year} 
                      onChange={e => setFormData({...formData, manufacture_year: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type (Optional)</Label>
                    <Select value={formData.fuel_type} onValueChange={v => setFormData({...formData, fuel_type: v as string})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fuel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diesel">Diesel</SelectItem>
                        <SelectItem value="Petrol">Petrol</SelectItem>
                        <SelectItem value="Electric">Electric</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                        <SelectItem value="CNG">CNG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Vehicle</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGate>
      </PageHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading vehicles data...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No vehicles found.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={vehicles} 
            searchKey="registration_number"
            searchPlaceholder="Search vehicles by registration..."
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-border p-5">
          <SheetHeader>
            <SheetTitle>Vehicle Details</SheetTitle>
            <SheetDescription>
              Information for {selectedVehicle?.vehicle_name} ({selectedVehicle?.registration_number}).
            </SheetDescription>
          </SheetHeader>
          {selectedVehicle && (
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vehicle Status</p>
                    <p className="font-semibold text-lg">{selectedVehicle.status}</p>
                  </div>
                  <Badge className="px-3 py-1" variant={selectedVehicle.status === "Available" ? "success" : selectedVehicle.status === "In Shop" ? "destructive" : selectedVehicle.status === "Retired" ? "secondary" : "default"}>
                    {selectedVehicle.status}
                  </Badge>
                </div>
                
                <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    {selectedVehicle.status === 'Available' && (
                      <Button onClick={() => handleUpdateStatus(selectedVehicle.id, "In Shop")} className="w-full font-semibold bg-amber-600 hover:bg-amber-700 text-white">
                        Send to Maintenance (In Shop)
                      </Button>
                    )}
                    
                    {selectedVehicle.status === 'In Shop' && (
                      <Button onClick={() => handleUpdateStatus(selectedVehicle.id, "Available")} className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
                        Mark Available
                      </Button>
                    )}
                    
                    {selectedVehicle.status !== 'Retired' && selectedVehicle.status !== 'On Trip' && (
                      <Button onClick={() => handleUpdateStatus(selectedVehicle.id, "Retired")} variant="outline" className="w-full">
                        Retire Vehicle
                      </Button>
                    )}
                  </div>
                </RoleGate>
              </div>

              <div className="bg-muted/10 p-6 rounded-xl border border-border/50 grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Registration</p>
                  <p className="font-semibold">{selectedVehicle.registration_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedVehicle.vehicle_type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Max Capacity</p>
                  <p className="font-medium">{selectedVehicle.max_load_capacity} kg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Odometer</p>
                  <p className="font-medium">{selectedVehicle.current_odometer} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Manufacturer</p>
                  <p className="font-medium">{selectedVehicle.manufacturer || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Model</p>
                  <p className="font-medium">{selectedVehicle.model || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Year</p>
                  <p className="font-medium">{selectedVehicle.manufacture_year || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Fuel</p>
                  <p className="font-medium">{selectedVehicle.fuel_type || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
