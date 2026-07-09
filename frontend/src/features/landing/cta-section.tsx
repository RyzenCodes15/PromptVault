/**
 * Call-to-action section with gradient background.
 */

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/80 via-indigo-950/60 to-background p-12 text-center sm:p-16"
        >
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[100px]" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to start your prompt business?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Join the fastest-growing marketplace for AI prompts. Whether you&apos;re a
            buyer looking for the perfect prompt or a creator ready to monetize
            your skills — PromptVault is your platform.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/40 transition-shadow"
            >
              Create Free Account
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 size-4"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-8 text-base"
            >
              Browse Marketplace
            </Button>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Free to browse · Start selling in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
