/**
 * Features grid section showcasing platform capabilities.
 */

"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Settings,
  CreditCard,
  Layers,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "Curated Prompts",
    description:
      "Every prompt is reviewed for quality. Browse a marketplace of tested, proven prompts that deliver stunning AI-generated images.",
  },
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Purchase and receive prompts instantly. Copy to clipboard, download in multiple formats, and start generating immediately.",
  },
  {
    icon: Settings,
    title: "Creator Tools",
    description:
      "Build your creator profile, track analytics, manage your prompt catalog, and grow your audience with built-in marketing tools.",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description:
      "Industry-standard payment processing powered by Stripe. Creators receive payouts directly to their bank accounts.",
  },
  {
    icon: Layers,
    title: "Multi-Model Support",
    description:
      "Prompts optimized for Midjourney, DALL·E, Stable Diffusion, and more. Filter by model to find exactly what you need.",
  },
  {
    icon: Users,
    title: "Creator Community",
    description:
      "Connect with fellow prompt engineers, share techniques, participate in challenges, and learn from the best in the field.",
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.4 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Features
          </span>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to buy and sell AI&nbsp;prompts
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            A complete platform built for prompt creators and AI artists,
            with the tools to succeed.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                className="group rounded-xl border border-border bg-vault-surface p-7 transition-all duration-300 hover:border-vault-gold/20 hover:bg-vault-elevated"
              >
                <div className="mb-5 inline-flex rounded-lg bg-vault-elevated p-2.5 text-secondary-foreground transition-colors group-hover:text-foreground">
                  <Icon className="size-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-base font-semibold">
                  {feature.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
