"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, Package, FileText, DollarSign, TrendingUp, Loader2, ShoppingBag } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { useSellerStats } from "@/hooks/use-orders";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface PromptItem {
  id: string;
  title: string;
  status: "active" | "inactive" | "deleted";
  price: number;
  created_at: string;
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["seller-prompts-overview"],
    queryFn: () => api.get("/api/prompts/me?limit=5"),
  });

  const { data: statsData, isLoading: statsLoading } = useSellerStats();

  if (!user) return null;

  const totalListings = data?.total ?? 0;
  const publishedCount =
    data?.items?.filter((item: PromptItem) => item.status === "active").length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Overview</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}. Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="gap-2 bg-vault-gold text-vault-surface hover:bg-vault-gold/90">
            <PlusCircle className="size-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
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
              <p className="text-2xl font-bold">{isLoading ? "..." : publishedCount}</p>
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
              <p className="text-2xl font-bold">
                {statsLoading ? "..." : `₹${(statsData?.total_revenue ?? 0).toFixed(2)}`}
              </p>
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
              <p className="text-2xl font-bold">
                {statsLoading ? "..." : statsData?.sales_count ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Listings & Recent Sales Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Listings */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold">Recent Listings</h2>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/50">
              <Loader2 className="size-8 animate-spin text-vault-gold" />
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
                    {data.items.map((item: PromptItem) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium">{item.title}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.status === "active"
                                ? "bg-green-500/10 text-green-500"
                                : item.status === "inactive"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-red-500/10 text-red-500"
                            }`}
                          >
                            {item.status === "active"
                              ? "Published"
                              : item.status === "inactive"
                              ? "Draft"
                              : "Archived"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">₹{item.price}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
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
              <p className="mt-2 max-w-sm text-muted-foreground">
                You haven&apos;t created any prompts yet. Start your journey by creating your first
                listing.
              </p>
              <Link href="/dashboard/create" className="mt-6">
                <Button className="bg-vault-gold text-vault-surface hover:bg-vault-gold/90">
                  Create First Listing
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="size-5 text-vault-gold" />
            Recent Sales
          </h2>

          {statsLoading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/50">
              <Loader2 className="size-8 animate-spin text-vault-gold" />
            </div>
          ) : statsData?.latest_orders && statsData.latest_orders.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border bg-vault-elevated shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Prompt Sold</th>
                      <th className="px-6 py-4 font-medium">Amount</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {statsData.latest_orders.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/30">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {sale.prompt_title}
                        </td>
                        <td className="px-6 py-4 font-semibold text-vault-gold">
                          ₹{sale.price_at_purchase}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(sale.created_at).toLocaleDateString()}
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
                <ShoppingBag className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-heading text-lg font-bold">No sales recorded</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                When buyers purchase your prompts, recent transactions will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
