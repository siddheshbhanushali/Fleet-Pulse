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
import { useAuth } from "@/context/AuthContext";
import { RoleGate } from "@/components/role-gate";
import { ROLES } from "@/lib/roles";

export default function RoutesPage() {
  const { user } = useAuth();
  const [routes, setRoutes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedRoute, setSelectedRoute] = React.useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    route_name: "",
    source: "",
    destination: "",
    distance: "",
    estimated_hours: "",
    status: "Active"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/routes");
      setRoutes(res.data.routes);
    } catch (error) {
      console.error("Failed to load routes", error);
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
        route_name: formData.route_name,
        source: formData.source,
        destination: formData.destination,
        distance: parseFloat(formData.distance),
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
        status: formData.status
      };
      
      await api.post("/routes", payload);
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        route_name: "",
        source: "",
        destination: "",
        distance: "",
        estimated_hours: "",
        status: "Active"
      });
      fetchData();
    } catch (error: any) {
      setFormError(error.response?.data?.message || "Failed to create route");
    }
  };

  const handleUpdateStatus = async (routeId: number, status: string) => {
    try {
      await api.put(`/routes/${routeId}`, { status });
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update route status");
    }
  };

  const handleDelete = async (routeId: number) => {
    if (!confirm("Are you sure you want to delete this route? This action cannot be undone.")) return;
    try {
      await api.delete(`/routes/${routeId}`);
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete route");
    }
  };

  const handleView = (route: any) => {
    setSelectedRoute(route);
    setIsSheetOpen(true);
  };

  const columns = [
    {
      accessorKey: "route_name",
      header: "Route Name",
      cell: ({ row }: any) => <div className="font-medium">{row.getValue("route_name")}</div>,
    },
    {
      accessorKey: "source",
      header: "Origin",
    },
    {
      accessorKey: "destination",
      header: "Destination",
    },
    {
      accessorKey: "distance",
      header: "Distance",
      cell: ({ row }: any) => `${row.getValue("distance")} km`,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.getValue("status");
        return (
          <Badge variant={status === "Active" ? "success" : "secondary"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const route = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className={buttonVariants({ variant: "ghost" }) + " h-8 w-8 p-0"}>
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleView(route)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDelete(route.id)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Route
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
        title="Routes" 
        description="Manage predefined routes for standardized trips and better analytics."
      >
        <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger className={buttonVariants()}>
              + Add Route
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Route</DialogTitle>
                <DialogDescription>
                  Define a new standard route that drivers can select during trips.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-6 mt-4">
                {formError && (
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Route Name</Label>
                    <Input 
                      required 
                      placeholder="e.g. NYC to BOS Express"
                      value={formData.route_name} 
                      onChange={e => setFormData({...formData, route_name: e.target.value})} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Source (Origin)</Label>
                      <Input 
                        required 
                        placeholder="e.g. New York, NY"
                        value={formData.source} 
                        onChange={e => setFormData({...formData, source: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <Input 
                        required 
                        placeholder="e.g. Boston, MA"
                        value={formData.destination} 
                        onChange={e => setFormData({...formData, destination: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Planned Distance (km)</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        required 
                        placeholder="e.g. 350"
                        value={formData.distance} 
                        onChange={e => setFormData({...formData, distance: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estimated Time (Hours) [Optional]</Label>
                      <Input 
                        type="number"
                        step="0.1"
                        placeholder="e.g. 4.5"
                        value={formData.estimated_hours} 
                        onChange={e => setFormData({...formData, estimated_hours: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Route</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </RoleGate>
      </PageHeader>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading routes data...</div>
        ) : routes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No predefined routes found.</div>
        ) : (
          <DataTable 
            columns={columns} 
            data={routes} 
            searchKey="route_name"
            searchPlaceholder="Search routes by name..."
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full border-border p-5">
          <SheetHeader>
            <SheetTitle>Route Details</SheetTitle>
            <SheetDescription>
              Information for {selectedRoute?.route_name}.
            </SheetDescription>
          </SheetHeader>
          {selectedRoute && (
            <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Route Status</p>
                    <p className="font-semibold text-lg">{selectedRoute.status}</p>
                  </div>
                  <Badge className="px-3 py-1" variant={selectedRoute.status === "Active" ? "success" : "secondary"}>
                    {selectedRoute.status}
                  </Badge>
                </div>
                
                <RoleGate allowedRoles={[ROLES.ADMIN, ROLES.FLEET_MANAGER]}>
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    {selectedRoute.status === 'Active' && (
                      <Button onClick={() => handleUpdateStatus(selectedRoute.id, "Inactive")} variant="outline" className="w-full">
                        Mark Inactive
                      </Button>
                    )}
                    
                    {selectedRoute.status === 'Inactive' && (
                      <Button onClick={() => handleUpdateStatus(selectedRoute.id, "Active")} className="w-full font-semibold bg-green-600 hover:bg-green-700 text-white">
                        Mark Active
                      </Button>
                    )}
                  </div>
                </RoleGate>
              </div>

              <div className="bg-muted/10 p-6 rounded-xl border border-border/50 grid grid-cols-2 gap-y-6 gap-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Origin</p>
                  <p className="font-semibold">{selectedRoute.source}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Destination</p>
                  <p className="font-semibold">{selectedRoute.destination}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Distance</p>
                  <p className="font-medium">{selectedRoute.distance} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Est. Time</p>
                  <p className="font-medium">{selectedRoute.estimated_hours ? `${selectedRoute.estimated_hours} hours` : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
