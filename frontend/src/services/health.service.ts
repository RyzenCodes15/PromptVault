/**
 * Health API service functions.
 */

import { apiClient } from "@/lib/api-client";
import type { HealthStatus } from "@/types/api";

export async function fetchHealthStatus(): Promise<HealthStatus> {
  return apiClient<HealthStatus>("/api/health");
}
