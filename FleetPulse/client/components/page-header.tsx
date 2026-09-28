import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButtonText?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actionButtonText,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-serif">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionButtonText && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="h-4 w-4" />
            {actionButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
