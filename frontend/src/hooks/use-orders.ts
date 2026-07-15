import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  CheckoutResponse,
  PaginatedPurchasesRead,
  SellerStatsResponse,
} from "@/types/api";

export function useCheckoutPrompt() {
  return useMutation<CheckoutResponse, Error, string>({
    mutationFn: async (promptId: string) => {
      return api.post("/api/orders/checkout", { prompt_id: promptId });
    },
  });
}

export function useMyPurchases(page: number = 1, limit: number = 20) {
  return useQuery<PaginatedPurchasesRead>({
    queryKey: ["my-purchases", page, limit],
    queryFn: () => api.get(`/api/orders/my-purchases?page=${page}&limit=${limit}`),
  });
}

export function useSellerStats() {
  return useQuery<SellerStatsResponse>({
    queryKey: ["seller-stats"],
    queryFn: () => api.get("/api/orders/seller-stats"),
  });
}

export async function downloadPromptFile(promptId: string, promptTitle: string = "prompt") {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${API_BASE_URL}/api/prompts/${promptId}/download`, { headers });
  if (!response.ok) {
    let detail = "Failed to download prompt file.";
    try {
      const err = await response.json();
      if (err?.detail) detail = err.detail;
    } catch {
      // ignore json parse error
    }
    throw new Error(detail);
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cleanTitle = promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_") || "prompt";
  a.download = `${cleanTitle}_prompt.txt`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
