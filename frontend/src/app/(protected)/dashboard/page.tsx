"use client";

import { useAuth } from "@/providers/auth-provider";
import { PlusCircle, TrendingUp, DollarSign, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Prompt {
  id: string;
  title: string;
  status: "active" | "inactive" | "deleted";
  price: number;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  
  const { data, isLoading } = useQuery({
    queryKey: ["seller-prompts-overview"],
    queryFn: () => api.get("/api/prompts/me?limit=5"),
  });

  if (!user) return null;

  const totalListings = data?.total || 0;
  const publishedListings = data?.items?.filter((p: Prompt) => p.status === "active").length || 0;


  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 bg-vault-gold text-background hover:bg-vault-gold/90">
            <PlusCircle className="size-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Package className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : totalListings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Published</p>
              <p className="text-2xl font-bold">{isLoading ? "..." : publishedListings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-500">
              <DollarSign className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₹0.00</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <TrendingUp className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-xl font-bold">Recent Listings</h2>
        
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/50">
            <p className="text-muted-foreground">Loading listings...</p>
          </div>
        ) : data?.items?.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-border bg-vault-elevated shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Title</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Price</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.items.map((prompt: Prompt) => (
                    <tr key={prompt.id} className="hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{prompt.title}</td>
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
                      <td className="px-6 py-4">₹{prompt.price}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(prompt.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/50 p-8 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
              <Package className="size-6 text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-bold">No listings yet</h3>
            <p className="mt-2 text-muted-foreground max-w-sm">
              You haven&apos;t created any prompts yet. Start your journey by creating your first listing.
            </p>
            <Link href="/dashboard/create" className="mt-6">
              <Button className="bg-vault-gold text-background hover:bg-vault-gold/90">
                Create First Listing
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
