/**
 * TanStack Query hook for backend health status.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchHealthStatus } from "@/services/health.service";
import type { HealthStatus } from "@/types/api";

export function useHealth() {
  return useQuery<HealthStatus>({
    queryKey: ["health"],
    queryFn: fetchHealthStatus,
    refetchInterval: 30_000,
    retry: 2,
  });
}
