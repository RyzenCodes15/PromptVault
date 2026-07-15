/**
 * Call-to-action section with dark surface background.
 */

"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-muted p-12 text-center sm:p-20"
        >
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to start your
            <br className="hidden sm:block" />
            prompt business?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Join the fastest-growing marketplace for AI prompts. Whether
            you&apos;re a buyer or a creator — PromptVault is your platform.
          </p>

          <div className="mt-10">
            <Link href="/register" className="inline-block">
              <Button
                size="lg"
                className="h-12 px-8 text-sm font-medium bg-foreground text-background hover:bg-vault-gold hover:text-background transition-colors"
              >
                Create Free Account
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            No credit card required · Free to browse · Start selling in minutes
          </p>
        </motion.div>
      </div>
    </section>
  );
}
