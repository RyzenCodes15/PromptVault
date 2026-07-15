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

export interface User {
  id: string;
  name: string;
  email: string;
  role: "buyer" | "seller";
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Prompt {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  short_description: string;
  full_description: string;
  price: number;
  cover_image_url?: string;
  prompt_text?: string;
  status: "active" | "inactive" | "deleted";
  created_at: string;
  updated_at: string;
  seller?: User;
  category?: Category;
}

export interface PaginatedPrompts {
  items: Prompt[];
  total: number;
  page: number;
  limit: number;
}
