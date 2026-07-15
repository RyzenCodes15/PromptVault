"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/providers/auth-provider";
import { PlusCircle, TrendingUp, DollarSign, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col pt-24 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight">Seller Dashboard</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage your prompts and track your earnings.
              </p>
            </div>
            <Link href="/dashboard/create">
              <Button className="gap-2 bg-vault-gold text-background hover:bg-vault-gold/90">
                <PlusCircle className="size-4" />
                Create Prompt
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
                  <DollarSign className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">₹0.00</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                  <Package className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Prompts</p>
                  <p className="text-2xl font-bold">0</p>
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

          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/50">
            <div className="text-center">
              <p className="text-muted-foreground">Prompt management coming in the next milestone.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
