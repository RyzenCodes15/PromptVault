import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Category, Prompt, PaginatedPrompts } from "@/types/api";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => api.get("/api/categories"),
  });
}

interface SearchPromptsParams {
  q?: string;
  category_id?: string;
  seller_id?: string;
  page?: number;
  limit?: number;
}

export function usePrompts(params: SearchPromptsParams = {}) {
  return useQuery<PaginatedPrompts>({
    queryKey: ["prompts", params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params.q) searchParams.append("q", params.q);
      if (params.category_id) searchParams.append("category_id", params.category_id);
      if (params.seller_id) searchParams.append("seller_id", params.seller_id);
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      
      const queryString = searchParams.toString();
      const endpoint = queryString ? `/api/prompts?${queryString}` : "/api/prompts";
      return api.get(endpoint);
    },
  });
}

export function usePrompt(id: string) {
  return useQuery<Prompt>({
    queryKey: ["prompt", id],
    queryFn: () => api.get(`/api/prompts/${id}`),
    enabled: !!id,
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Prompt>) => api.post("/api/prompts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
    },
  });
}

export function useUpdatePrompt(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Prompt>) => api.put(`/api/prompts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompt", id] });
      queryClient.invalidateQueries({ queryKey: ["seller-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-prompts-overview"] });
    },
  });
}
