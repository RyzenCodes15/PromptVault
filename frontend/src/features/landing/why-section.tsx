/**
 * "Why PromptVault" section with value propositions and statistics.
 */

"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "50K+", label: "Prompts Sold" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24h", label: "Avg. Payout Time" },
  { value: "₹2Cr+", label: "Creator Earnings" },
] as const;

const VALUE_PROPS = [
  {
    title: "Built for Creators",
    description:
      "Set your own prices, retain full ownership of your prompts, and earn up to 85% on every sale. No hidden fees, no surprises.",
  },
  {
    title: "Quality Guaranteed",
    description:
      "Every prompt goes through our verification process. Buyers see real AI-generated preview images so they know exactly what they're getting.",
  },
  {
    title: "Grow Your Brand",
    description:
      "Build a public creator profile, gather reviews, earn badges, and climb the leaderboard. Your reputation is your business.",
  },
] as const;

export function WhySection() {
  return (
    <section id="why" className="relative py-28 sm:py-36">
      {/* Subtle top divider */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10">
        <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Why PromptVault
            </span>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              The platform that puts creators&nbsp;first
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              We built PromptVault because prompt engineering is a real skill —
              and creators deserve a professional platform to monetize it.
            </p>

            <div className="mt-12 space-y-8">
              {VALUE_PROPS.map((prop, i) => (
                <motion.div
                  key={prop.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="flex gap-4"
                >
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-xs font-semibold text-muted-foreground">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">{prop.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {prop.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Stats Grid */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex items-center"
          >
            <div className="grid w-full grid-cols-2 gap-4">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                  className="rounded-xl border border-border bg-vault-surface p-6 text-center"
                >
                  <div className="font-heading text-3xl font-semibold text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1.5 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
