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
  is_purchased?: boolean;
  is_owner?: boolean;
}

export interface PaginatedPrompts {
  items: Prompt[];
  total: number;
  page: number;
  limit: number;
}

export interface CheckoutResponse {
  checkout_url: string;
  session_id: string;
  order_id: string;
}

export interface OrderItemRead {
  id: string;
  order_id: string;
  prompt_id: string;
  seller_id: string;
  price_at_purchase: number;
  created_at: string;
  prompt_title: string;
  prompt_short_description: string;
  prompt_cover_image_url?: string;
  prompt_category_name: string;
  seller_name: string;
  seller_avatar_url?: string;
  order_status: "pending" | "completed" | "failed" | "refunded";
}

export interface PaginatedPurchasesRead {
  items: OrderItemRead[];
  total: number;
  page: number;
  limit: number;
}

export interface SellerSaleItemRead {
  id: string;
  prompt_id: string;
  prompt_title: string;
  price_at_purchase: number;
  created_at: string;
}

export interface SellerStatsResponse {
  sales_count: number;
  total_revenue: number;
  latest_orders: SellerSaleItemRead[];
}
