"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";

const data = [
  { id: "ALT-001", message: "Vehicle V-1004 speed limit exceeded", severity: "High", time: "10:30 AM" },
  { id: "ALT-002", message: "Low Fuel: V-1002", severity: "Medium", time: "11:15 AM" },
];

export default function AlertsPage() {
  const columns = [
    { accessorKey: "id", header: "Alert ID" },
    { accessorKey: "message", header: "Message" },
    { accessorKey: "severity", header: "Severity" },
    { accessorKey: "time", header: "Time" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Alerts" description="Real-time system and fleet alerts." actionButtonText="Configure Alerts" />
      <DataTable columns={columns} data={data} searchKey="message" searchPlaceholder="Search alerts..." />
    </div>
  );
}
