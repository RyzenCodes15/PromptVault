/**
 * Backend health status indicator badge.
 * Fetches /api/health and shows a live connection status pill.
 */

"use client";

import { useHealth } from "@/hooks/use-health";
import { cn } from "@/lib/utils";

export function HealthIndicator() {
  const { data, isLoading, isError } = useHealth();

  const isOnline = data?.status === "healthy";

  return (
    <div
      id="health-indicator"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        isLoading && "bg-muted text-muted-foreground",
        isError && "bg-red-500/10 text-red-400",
        isOnline && "bg-emerald-500/10 text-emerald-400",
        !isLoading && !isError && !isOnline && "bg-amber-500/10 text-amber-400"
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          isLoading && "animate-pulse bg-muted-foreground",
          isError && "bg-red-400",
          isOnline && "animate-pulse bg-emerald-400",
          !isLoading && !isError && !isOnline && "bg-amber-400"
        )}
      />
      {isLoading && "Connecting…"}
      {isError && "Backend Offline"}
      {isOnline && "Backend Online"}
      {!isLoading && !isError && !isOnline && "Backend Degraded"}
    </div>
  );
}
