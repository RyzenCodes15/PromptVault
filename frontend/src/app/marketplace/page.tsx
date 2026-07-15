"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PromptCard } from "@/components/ui/prompt-card";
import { CategoryChip } from "@/components/ui/category-chip";
import { useCategories, usePrompts } from "@/hooks/use-marketplace";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce"; // We need to create this

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: promptsData, isLoading: promptsLoading } = usePrompts({
    q: debouncedSearch,
    category_id: selectedCategory,
    limit: 12,
  });

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col pt-24 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          {/* Header & Search */}
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-4">
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Discover <span className="text-vault-gold">Premium</span> Prompts
              </h1>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Elevate your workflow with expertly crafted prompts for AI image generation, writing, coding, and more.
              </p>
            </div>
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-full pl-12 text-base shadow-sm bg-vault-elevated border-vault-elevated/50 focus-visible:ring-vault-gold"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(undefined)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "border-vault-gold bg-vault-gold text-vault-surface"
                    : "border-border bg-vault-elevated text-foreground hover:border-vault-gold/50 hover:bg-vault-elevated/80"
                }`}
              >
                All
              </button>
              {categoriesLoading ? (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-vault-elevated" />
                  ))}
                </div>
              ) : (
                categories?.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    isActive={selectedCategory === category.id}
                    onClick={() => setSelectedCategory(category.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Results Grid */}
          {promptsLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="size-8 animate-spin text-vault-gold" />
            </div>
          ) : promptsData?.items && promptsData.items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {promptsData.items.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-vault-elevated/20 text-center p-8">
              <div className="flex size-16 items-center justify-center rounded-full bg-vault-elevated mb-4">
                <Search className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No prompts found</h3>
              <p className="mt-2 max-w-sm text-muted-foreground">
                We couldn&apos;t find any prompts matching your search. Try adjusting your filters or search terms.
              </p>
              {(search || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(undefined);
                  }}
                  className="mt-6 font-medium text-vault-gold hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
