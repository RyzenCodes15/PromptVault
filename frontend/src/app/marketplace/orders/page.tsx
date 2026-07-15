"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useMyPurchases, downloadPromptFile } from "@/hooks/use-orders";
import { OrderItemRead } from "@/types/api";
import {
  Vault,
  ShoppingBag,
  Download,
  Loader2,
  Calendar,
  ExternalLink,
  Tag,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyPurchasesPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useMyPurchases(page, limit);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (item: OrderItemRead) => {
    setDownloadingId(item.id);
    try {
      await downloadPromptFile(item.prompt_id, item.prompt_title);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col pt-24 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                <ShoppingBag className="size-8 text-vault-gold" />
                My Purchases
              </h1>
              <p className="mt-1 text-muted-foreground">
                View your complete purchase history and download your prompt files anytime.
              </p>
            </div>
            {data && data.total > 0 && (
              <div className="rounded-lg bg-vault-elevated px-4 py-2 border border-border text-sm font-medium text-muted-foreground">
                Total Purchased: <span className="font-bold text-vault-gold">{data.total}</span>
              </div>
            )}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="size-8 animate-spin text-vault-gold mb-3" />
              <p className="text-sm text-muted-foreground">Loading your purchase history...</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-vault-elevated py-20 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-40">
                <ShoppingBag className="size-8" />
              </div>
              <h2 className="font-heading text-xl font-semibold">No purchases yet</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">
                You haven&apos;t purchased any prompts from the marketplace yet. Explore our curated selection of high-yield AI prompts!
              </p>
              <Link href="/">
                <Button className="mt-6 bg-vault-gold text-vault-surface hover:bg-vault-gold/90 font-semibold">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden rounded-2xl border border-border bg-vault-elevated">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="px-6 py-4">Prompt Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Seller</th>
                        <th className="px-6 py-4">Price Paid</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-sm">
                      {data.items.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted border border-border/50">
                                {item.prompt_cover_image_url ? (
                                  <img
                                    src={item.prompt_cover_image_url}
                                    alt={item.prompt_title}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <Vault className="size-6 text-muted-foreground opacity-30" />
                                )}
                              </div>
                              <div>
                                <Link
                                  href={`/prompt/${item.prompt_id}`}
                                  className="font-semibold text-foreground hover:text-vault-gold transition-colors flex items-center gap-1.5"
                                >
                                  {item.prompt_title}
                                  <ExternalLink className="size-3.5 opacity-60" />
                                </Link>
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs mt-0.5">
                                  {item.prompt_short_description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              <Tag className="size-3" />
                              {item.prompt_category_name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-vault-gold/20 text-vault-gold text-xs font-bold overflow-hidden">
                                {item.seller_avatar_url ? (
                                  <img
                                    src={item.seller_avatar_url}
                                    alt={item.seller_name}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="size-3.5" />
                                )}
                              </div>
                              <span className="font-medium text-foreground">{item.seller_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-vault-gold">
                            ₹{item.price_at_purchase}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground text-xs">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="size-3.5" />
                              {new Date(item.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/prompt/${item.prompt_id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                onClick={() => handleDownload(item)}
                                disabled={downloadingId === item.id}
                                className="bg-vault-gold text-vault-surface hover:bg-vault-gold/90 font-medium gap-1.5"
                              >
                                {downloadingId === item.id ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <Download className="size-4" />
                                )}
                                Download (.txt)
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination controls */}
              {data.total > limit && (
                <div className="flex items-center justify-between border-t border-border pt-4 text-sm">
                  <p className="text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, data.total)} of {data.total} purchases
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= data.total}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
