"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { XCircle, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CancelContent() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-vault-elevated p-8 text-center shadow-lg">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <XCircle className="size-10" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Checkout Cancelled</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        Your payment process was cancelled or interrupted. No charges were made to your card.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="flex-1">
          <Button className="w-full bg-vault-gold text-vault-surface hover:bg-vault-gold/90 font-semibold gap-2">
            <RefreshCw className="size-4" />
            Try Again
          </Button>
        </Link>
        <Link href="/marketplace" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="size-4" />
            Marketplace
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-24 pb-16 px-6">
        <Suspense fallback={<Loader2 className="size-8 animate-spin text-vault-gold" />}>
          <CancelContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
