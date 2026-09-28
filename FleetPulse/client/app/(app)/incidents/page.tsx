"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";

const data = [
  { id: "INC-001", type: "Accident", severity: "High", location: "Main St", status: "Open" },
  { id: "INC-002", type: "Breakdown", severity: "Medium", location: "Route 4", status: "Resolved" },
];

export default function IncidentsPage() {
  const columns = [
    { accessorKey: "id", header: "Incident ID" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "severity", header: "Severity" },
    { accessorKey: "location", header: "Location" },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Incidents" description="Log and track operational incidents." actionButtonText="Report Incident" />
      <DataTable columns={columns} data={data} searchKey="type" searchPlaceholder="Search incidents by type..." />
    </div>
  );
}
