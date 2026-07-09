/**
 * API response types matching the backend envelope format.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
  detail: string | null;
}

export interface HealthStatus {
  status: "healthy" | "degraded";
  database: "connected" | "disconnected";
  timestamp: string;
}
