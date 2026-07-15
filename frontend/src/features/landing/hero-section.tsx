/**
 * Hero section with editorial typography and search bar.
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center pt-16">
      {/* Subtle grain texture — no gradients or blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-background" />

      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-vault-surface px-4 py-1.5 text-xs font-medium tracking-wide text-secondary-foreground uppercase">
              <span className="size-1.5 rounded-full bg-vault-emerald" />
              Now in Early Access
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mt-10 font-heading text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]"
          >
            The Marketplace
            <br />
            for{" "}
            <span className="text-vault-gold">AI&nbsp;Prompts</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            Discover, buy, and sell expertly crafted prompts for AI image
            generation. Join thousands of creators turning their prompt
            engineering skills into revenue.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            className="mx-auto mt-12 max-w-xl"
          >
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border border-border bg-vault-surface p-1.5 transition-colors focus-within:border-vault-gold/40">
              <div className="flex items-center gap-3 pl-3 flex-1">
                <Search className="size-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search prompts, styles, creators…"
                  className="h-10 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  aria-label="Search prompts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-10 px-6 text-sm bg-foreground text-background hover:bg-vault-gold hover:text-background transition-colors shrink-0"
              >
                Search
              </Button>
            </form>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link href="/marketplace" className="inline-block">
              <Button
                size="lg"
                className="h-12 px-8 text-sm font-medium bg-foreground text-background hover:bg-vault-gold hover:text-background transition-colors w-full sm:w-auto"
              >
                Explore Prompts
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/register" className="inline-block">
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-sm font-medium w-full sm:w-auto"
              >
                Start Selling
              </Button>
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((letter, i) => (
                  <div
                    key={i}
                    className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-vault-elevated text-[10px] font-semibold text-secondary-foreground"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <span>2,400+ creators</span>
            </div>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <span>12,000+ prompts listed</span>
            <div className="hidden h-4 w-px bg-border sm:block" />
            <span>4.9★ average rating</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
