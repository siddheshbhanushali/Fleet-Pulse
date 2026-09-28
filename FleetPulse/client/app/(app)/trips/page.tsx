"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2, Plus } from "lucide-react";
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
import api from "@/lib/axios";

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString();
};

export default function TripsPage() {
  const [trips, setTrips] = React.useState<any[]>([]);
  const [vehicles, setVehicles] = React.useState<any[]>([]);
  const [drivers, setDrivers] = React.useState<any[]>([]);
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [entryMode, setEntryMode] = React.useState<'manual' | 'predefined'>('manual');
  
  const [loading, setLoading] = React.useState(true);
  
  const [selectedTrip, setSelectedTrip] = React.useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    trip_number: `TR-${Math.floor(1000 + Math.random() * 90000)}`,
    vehicle_id: "",
    driver_id: "",
    route_id: "",
    source: "",
    destination: "",
    cargo_type: "",
    cargo_weight: "",
    planned_distance: "",
    planned_start: "",
    start_odometer: ""
  });

  const [completeData, setCompleteData] = React.useState({
    end_odometer: "",
    fuel_consumed: "",
    revenue: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tripsRes, vehiclesRes, driversRes, routesRes] = await Promise.all([
        api.get("/trips"),
        api.get("/vehicles?status=Available"),
        api.get("/drivers?status=Available"),
        api.get("/routes?status=Active")
      ]);
      setTrips(tripsRes.data.trips || []);
      setVehicles(vehiclesRes.data.vehicles || []);
      setDrivers(driversRes.data.drivers || []);
      setRoutes(routesRes.data.routes || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const vehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    if (!vehicle) {
      setFormError("Please select a vehicle.");
      return;
    }

    const weight = parseFloat(formData.cargo_weight);
    if (weight <= 0) {
      setFormError("Cargo weight must be greater than 0.");
      return;
    }

    if (weight > Number(vehicle.max_load_capacity)) {
      setFormError(`Cargo weight (${weight} kg) exceeds vehicle's maximum capacity of ${vehicle.max_load_capacity} kg.`);
      return;
    }

    const distance = parseFloat(formData.planned_distance);
    if (distance <= 0) {
      setFormError("Planned distance must be greater than 0.");
      return;
    }

    const odometer = parseInt(formData.start_odometer);
    if (odometer < 0) {
      setFormError("Starting odometer cannot be negative.");
      return;
    }

    try {
      const payload = {
        ...formData,
        vehicle_id: parseInt(formData.vehicle_id),
        driver_id: parseInt(formData.driver_id),
        route_id: formData.route_id ? parseInt(formData.route_id) : undefined,
        cargo_weight: weight,
        planned_distance: distance,
        start_odometer: odometer,
        planned_start: new Date(formData.planned_start).toISOString(),
      };
      
      await api.post("/trips", payload);
      setIsCreateModalOpen(false);
      
      // Reset form ID
      setFormData(prev => ({ ...prev, trip_number: `TR-${Math.floor(1000 + Math.random() * 9000)}` }));
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create trip");
    }
  };

  const handleDispatch = async (tripId: number) => {
    try {
      await api.post(`/trips/${tripId}/dispatch`);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to dispatch trip");
    }
  };

  const handleCancel = async (tripId: number) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    try {
      await api.post(`/trips/${tripId}/cancel`);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to cancel trip");
    }
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      await api.post(`/trips/${selectedTrip.id}/complete`, {
        end_odometer: parseInt(completeData.end_odometer),
        fuel_consumed: parseFloat(completeData.fuel_consumed),
        revenue: parseFloat(completeData.revenue)
      });
      setIsCompleteModalOpen(false);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to complete trip");
    }
  };

  const handleView = (trip: any) => {
    setSelectedTrip(trip);
    setIsSheetOpen(true);
  };

  const columns = [
    {
      accessorKey: "trip_number",
      header: "Trip ID",
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("trip_number")}</div>,
    },
    {
      id: "route",
      header: "Route",
      cell: ({ row }: any) => {
        const trip = row.original;
        return `${trip.source} -> ${trip.destination}`;
      }
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
      id: "driver",
      header: "Driver",
      cell: ({ row }: any) => {
        const d = row.original.drivers;
        return d ? `${d.first_name} ${d.last_name}` : "N/A";
      }
    },
    {
      accessorKey: "planned_start",
      header: "Start Time",
      cell: ({ row }: any) => formatDate(row.getValue("planned_start"))
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "Completed" ? "success" : status === "Dispatched" ? "default" : status === "Cancelled" ? "destructive" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const trip = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(trip)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Cancel Trip
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
        title="Trips" 
        description="Monitor active, scheduled, and completed trips in real-time."
      >
        <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger className={buttonVariants({ variant: "default" }) + " gap-2"}>
              <Plus className="h-4 w-4" />
              Create Trip
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogDescription>
                  Schedule a new trip and assign a driver and vehicle.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTrip} className="space-y-6 py-4">
                {formError && (
                  <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/30">
                    {formError}
                  </div>
                )}
                
                <div className="flex gap-4 p-1 bg-muted/50 rounded-lg w-fit">
                  <Button 
                    type="button" 
                    variant={entryMode === 'manual' ? 'default' : 'ghost'} 
                    onClick={() => setEntryMode('manual')}
                    className="h-8"
                  >
                    Manual Entry
                  </Button>
                  <Button 
                    type="button" 
                    variant={entryMode === 'predefined' ? 'default' : 'ghost'} 
                    onClick={() => setEntryMode('predefined')}
                    className="h-8"
                  >
                    Pre-defined Route
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trip Number</Label>
                    <Input value={formData.trip_number} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Planned Start Time</Label>
                    <Input type="datetime-local" required value={formData.planned_start} onChange={e => setFormData({...formData, planned_start: e.target.value})} />
                  </div>
                </div>

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
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.vehicle_name} ({v.registration_number})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Driver</Label>
                    <Select value={formData.driver_id} onValueChange={v => setFormData({...formData, driver_id: v as string})} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select driver">
                          {formData.driver_id
                            ? (() => {
                                const d = drivers.find(x => x.id.toString() === formData.driver_id);
                                return d ? `${d.first_name} ${d.last_name}` : "Select driver";
                              })()
                            : "Select driver"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {drivers.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>{d.first_name} {d.last_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {entryMode === 'predefined' && (
                  <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border/50">
                    <Label>Select Route</Label>
                    <Select 
                      value={formData.route_id} 
                      onValueChange={v => {
                        const r = routes.find(x => x.id.toString() === v);
                        if (r) {
                          setFormData({
                            ...formData, 
                            route_id: v as string,
                            source: r.source,
                            destination: r.destination,
                            planned_distance: r.distance.toString()
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pre-defined route">
                          {formData.route_id 
                            ? (() => {
                                const r = routes.find(x => x.id.toString() === formData.route_id);
                                return r ? `${r.route_name} (${r.distance} km)` : "Select a route";
                              })()
                            : "Select a route"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map(r => (
                          <SelectItem key={r.id} value={r.id.toString()}>{r.route_name} ({r.distance} km)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Location</Label>
                    <Input required placeholder="E.g. Warehouse A" value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} disabled={entryMode === 'predefined'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Location</Label>
                    <Input required placeholder="E.g. Distribution Center" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} disabled={entryMode === 'predefined'} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargo Type</Label>
                    <Input required placeholder="E.g. Electronics" value={formData.cargo_type} onChange={e => setFormData({...formData, cargo_type: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo Weight (kg)</Label>
                    <Input type="number" step="0.01" required placeholder="500.00" value={formData.cargo_weight} onChange={e => setFormData({...formData, cargo_weight: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Planned Distance (km)</Label>
                    <Input type="number" step="0.1" required placeholder="120.5" value={formData.planned_distance} onChange={e => setFormData({...formData, planned_distance: e.target.value})} disabled={entryMode === 'predefined'} />
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Odometer</Label>
                    <Input type="number" required placeholder="45000" value={formData.start_odometer} onChange={e => setFormData({...formData, start_odometer: e.target.value})} />
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Trip</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGate>
      </PageHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading trips data...</div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No trips found.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={trips} 
            searchKey="trip_number"
            searchPlaceholder="Search trips by ID..."
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-border p-5">
          <SheetHeader>
            <SheetTitle>Trip Details</SheetTitle>
            <SheetDescription>
              Information for {selectedTrip?.trip_number}.
            </SheetDescription>
          </SheetHeader>
          {selectedTrip && (
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trip Status</p>
                    <p className="font-semibold text-lg">{selectedTrip.status}</p>
                  </div>
                  <Badge className="px-3 py-1" variant={selectedTrip.status === "Completed" ? "success" : selectedTrip.status === "Dispatched" ? "default" : selectedTrip.status === "Cancelled" ? "destructive" : "secondary"}>
                    {selectedTrip.status}
                  </Badge>
                </div>
                
                <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER, ROLES.DRIVER]}>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    {selectedTrip.status === 'Draft' && (
                      <Button onClick={() => handleDispatch(selectedTrip.id)} className="w-full font-semibold">
                        Dispatch Trip
                      </Button>
                    )}
                    
                    {selectedTrip.status === 'Dispatched' && (
                      <Button onClick={() => setIsCompleteModalOpen(true)} variant="default" className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
                        Complete Trip
                      </Button>
                    )}
                    
                    {(selectedTrip.status === 'Draft' || selectedTrip.status === 'Dispatched') && (
                      <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                        <Button onClick={() => handleCancel(selectedTrip.id)} variant="destructive" className="w-full">
                          Cancel Trip
                        </Button>
                      </RoleGate>
                    )}
                  </div>
                </RoleGate>
              </div>

              <div className="bg-muted/10 p-6 rounded-xl border border-border/50 grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Trip ID</p>
                  <p className="font-semibold">{selectedTrip.trip_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Route</p>
                  <p className="font-medium">{selectedTrip.source} &rarr; {selectedTrip.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Driver</p>
                  <p className="font-medium">{selectedTrip.drivers ? `${selectedTrip.drivers.first_name} ${selectedTrip.drivers.last_name}` : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{selectedTrip.vehicles ? `${selectedTrip.vehicles.vehicle_name}` : "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Cargo</p>
                  <p className="font-medium">{selectedTrip.cargo_type} ({selectedTrip.cargo_weight} kg)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Start Time</p>
                  <p className="font-medium">{formatDate(selectedTrip.planned_start)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Distance</p>
                  <p className="font-medium">{selectedTrip.planned_distance} km</p>
                </div>
                {selectedTrip.status === 'Completed' && (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">End Odometer</p>
                      <p className="font-medium">{selectedTrip.end_odometer}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Fuel Consumed</p>
                      <p className="font-medium">{selectedTrip.fuel_consumed} L</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
            <DialogDescription>
              Enter final trip details to mark this trip as completed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>End Odometer</Label>
              <Input 
                type="number" 
                required 
                placeholder="e.g. 45120"
                value={completeData.end_odometer} 
                onChange={e => setCompleteData({...completeData, end_odometer: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Fuel Consumed (Liters)</Label>
              <Input 
                type="number" 
                step="0.1" 
                required 
                placeholder="e.g. 45.5"
                value={completeData.fuel_consumed} 
                onChange={e => setCompleteData({...completeData, fuel_consumed: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Revenue Generated (₹)</Label>
              <Input 
                type="number" 
                step="0.01" 
                required 
                placeholder="e.g. 1500.00"
                value={completeData.revenue} 
                onChange={e => setCompleteData({...completeData, revenue: e.target.value})} 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCompleteModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Complete Trip</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
