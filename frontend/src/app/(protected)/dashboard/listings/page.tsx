"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  PlusCircle,
  Package,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Prompt {
  id: string;
  title: string;
  status: "active" | "inactive" | "deleted";
  price: number;
  created_at: string;
  category: {
    name: string;
  };
}

export default function MyListingsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);

  // Debounce search
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  });

  const queryParams = new URLSearchParams({
    limit: "10",
    page: page.toString(),
  });
  
  if (debouncedSearch) queryParams.append("q", debouncedSearch);
  if (statusFilter !== "all") queryParams.append("status", statusFilter);

  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-prompts", debouncedSearch, statusFilter, page],
    queryFn: () => api.get(`/api/prompts/me?${queryParams.toString()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/prompts/${id}`),
    onSuccess: () => {
      toast.success("Listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["seller-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-prompts-overview"] });
      setPromptToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete listing");
      setPromptToDelete(null);
    }
  });

  const handleDelete = () => {
    if (promptToDelete) {
      deleteMutation.mutate(promptToDelete.id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">My Listings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your prompts, track their status, and update listings.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 bg-vault-gold text-background hover:bg-vault-gold/90">
            <PlusCircle className="size-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-vault-elevated shadow-sm">
        <div className="flex flex-col gap-4 border-b border-border p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              {(['all', 'active', 'inactive'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "secondary" : "ghost"}
                  className="capitalize"
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="flex items-center justify-center p-12 text-red-500">
            <AlertCircle className="mr-2 size-5" />
            <p>Failed to load listings. Please try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-vault-gold" />
          </div>
        ) : data?.items?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Title</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((prompt: Prompt) => (
                  <tr key={prompt.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{prompt.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{prompt.category.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        prompt.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        prompt.status === 'inactive' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {prompt.status === 'active' ? 'Published' :
                         prompt.status === 'inactive' ? 'Draft' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{prompt.price}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground outline-none">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Link href={`/prompt/${prompt.id}`} className="cursor-pointer">
                              <Eye className="mr-2 size-4" /> View public
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/dashboard/listings/${prompt.id}/edit`} className="cursor-pointer">
                              <Edit className="mr-2 size-4" /> Edit listing
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-500 focus:text-red-500"
                            onClick={() => setPromptToDelete(prompt)}
                          >
                            <Trash2 className="mr-2 size-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Package className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-bold">No listings found</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your filters or search query." 
                : "You haven't created any prompts yet."}
            </p>
          </div>
        )}

        {/* Pagination placeholder */}
        {data?.total > 10 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to <span className="font-medium">{Math.min(page * 10, data.total)}</span> of{" "}
              <span className="font-medium">{data.total}</span> results
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={page * 10 >= data.total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your prompt &quot;{promptToDelete?.title}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Trash2 className="mr-2 size-4" />}
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
