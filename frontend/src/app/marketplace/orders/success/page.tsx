"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CheckCircle2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-border bg-vault-elevated p-8 text-center shadow-lg">
      <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="size-10" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Payment Successful!</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        Your order has been confirmed and fulfilled. You now have permanent unlocked access to view and download your prompt.
      </p>
      {sessionId && (
        <div className="mt-4 rounded-lg bg-black/30 px-3 py-2 border border-border/50 text-xs font-mono text-muted-foreground overflow-hidden text-ellipsis">
          Session ID: {sessionId}
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/marketplace/orders" className="flex-1">
          <Button className="w-full bg-vault-gold text-vault-surface hover:bg-vault-gold/90 font-semibold gap-2">
            <ShoppingBag className="size-4" />
            My Purchases
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            Explore More
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-screen items-center justify-center pt-24 pb-16 px-6">
        <Suspense fallback={<Loader2 className="size-8 animate-spin text-vault-gold" />}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
