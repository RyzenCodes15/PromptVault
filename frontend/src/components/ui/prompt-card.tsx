"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Vault, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Prompt } from "@/types/api";

interface PromptCardProps {
  prompt: Prompt;
  className?: string;
}

export function PromptCard({ prompt, className }: PromptCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-vault-elevated transition-colors hover:border-vault-gold/50",
        className
      )}
    >
      <Link href={`/prompt/${prompt.id}`} className="absolute inset-0 z-10">
        <span className="sr-only">View {prompt.title}</span>
      </Link>
      
      {/* Cover Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {prompt.cover_image_url ? (
          <img
            src={prompt.cover_image_url}
            alt={prompt.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-vault-gold/50 transition-transform duration-300 group-hover:scale-105">
            <Vault className="size-12 opacity-50" />
          </div>
        )}
        
        {/* Category Badge overlay */}
        {prompt.category && (
          <div className="absolute left-3 top-3 z-20 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold tracking-tight text-foreground backdrop-blur-md">
            {prompt.category.name}
          </div>
        )}
        
        {/* Price Tag overlay */}
        <div className="absolute bottom-3 right-3 z-20 rounded-lg bg-background/90 px-3 py-1.5 text-sm font-bold text-vault-gold shadow-sm backdrop-blur-md">
          ₹{prompt.price}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-heading text-lg font-semibold tracking-tight text-foreground">
          {prompt.title}
        </h3>
        
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {prompt.short_description}
        </p>
        
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          {prompt.seller && (
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-vault-gold/20 text-vault-gold">
                {prompt.seller.avatar_url ? (
                  <img src={prompt.seller.avatar_url} alt={prompt.seller.name} className="size-full object-cover" />
                ) : (
                  <UserIcon className="size-3" />
                )}
              </div>
              <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                {prompt.seller.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
