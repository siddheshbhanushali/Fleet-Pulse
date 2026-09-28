"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable } from "@/components/data-table";

const data = [
  { id: "REP-001", name: "Monthly Fleet Efficiency", date: "2023-11-01", status: "Generated", format: "PDF" },
  { id: "REP-002", name: "Driver Performance Q3", date: "2023-10-15", status: "Generated", format: "Excel" },
];

export default function ReportsPage() {
  const columns = [
    { accessorKey: "id", header: "Report ID" },
    { accessorKey: "name", header: "Report Name" },
    { accessorKey: "date", header: "Generated Date" },
    { accessorKey: "format", header: "Format" },
    { accessorKey: "status", header: "Status" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader title="Reports" description="Generate and download operational reports." actionButtonText="Generate Report" />
      <DataTable columns={columns} data={data} searchKey="name" searchPlaceholder="Search reports..." />
    </div>
  );
}
