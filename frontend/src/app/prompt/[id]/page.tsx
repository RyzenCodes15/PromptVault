"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { usePrompt, usePrompts } from "@/hooks/use-marketplace";
import { PromptCard } from "@/components/ui/prompt-card";
import { Vault, User as UserIcon, Loader2, ArrowLeft, Calendar, Tag, Lock, Unlock, Copy, Download, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PromptDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: prompt, isLoading } = usePrompt(id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (prompt?.prompt_text) {
      navigator.clipboard.writeText(prompt.prompt_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (prompt?.prompt_text) {
      const blob = new Blob([prompt.prompt_text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${prompt.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prompt.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Fetch related prompts (same category)
  const { data: relatedData } = usePrompts({
    category_id: prompt?.category?.id,
    limit: 4,
  });

  const relatedPrompts = relatedData?.items?.filter(p => p.id !== id).slice(0, 4) || [];

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center pt-16">
          <Loader2 className="size-8 animate-spin text-vault-gold" />
        </main>
      </>
    );
  }

  if (!prompt) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center pt-16 px-6 text-center">
          <Vault className="size-16 text-muted-foreground opacity-20 mb-6" />
          <h1 className="font-heading text-2xl font-bold tracking-tight">Prompt Not Found</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            The prompt you are looking for does not exist or has been removed.
          </p>
          <Link href="/">
            <Button className="mt-8 bg-vault-gold text-vault-surface hover:bg-vault-gold/90">
              Back to Marketplace
            </Button>
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col pt-24 pb-16">
        <div className="mx-auto w-full max-w-7xl px-6">
          {/* Back Button */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Marketplace
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Left Column: Image & Details */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-muted/20">
                {prompt.cover_image_url ? (
                  <img
                    src={prompt.cover_image_url}
                    alt={prompt.title}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center">
                    <Vault className="size-16 text-muted-foreground opacity-20" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="font-heading text-2xl font-semibold tracking-tight border-b border-border pb-4">
                  About this Prompt
                </h2>
                <div className="mt-6 prose prose-invert prose-p:text-muted-foreground prose-a:text-vault-gold max-w-none">
                  <p className="text-lg leading-relaxed">{prompt.full_description}</p>
                </div>
              </div>

              {/* Unlocked Prompt Section */}
              <div className="mt-8 rounded-2xl border border-border bg-vault-elevated overflow-hidden">
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-6 py-4">
                  <div className="flex items-center gap-2">
                    {prompt.prompt_text ? (
                      <>
                        <Unlock className="size-5 text-vault-gold" />
                        <h2 className="font-heading text-lg font-semibold text-vault-gold">Unlocked Prompt</h2>
                      </>
                    ) : (
                      <>
                        <Lock className="size-5 text-muted-foreground" />
                        <h2 className="font-heading text-lg font-semibold text-muted-foreground">Prompt Locked</h2>
                      </>
                    )}
                  </div>
                  
                  {prompt.prompt_text && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
                        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                        <Download className="size-4" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  {prompt.prompt_text ? (
                    <div className="relative rounded-lg bg-black/40 p-4 border border-border/50">
                      <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-mono">
                        {prompt.prompt_text}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Lock className="size-12 mb-4 opacity-20" />
                      <p>Purchase this prompt to unlock the prompt text and instructions.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 flex flex-col gap-6 rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm">
                <div>
                  <h1 className="font-heading text-3xl font-bold tracking-tight">{prompt.title}</h1>
                  <p className="mt-2 text-lg font-medium text-muted-foreground">
                    {prompt.short_description}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-y border-border py-4">
                  <div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-vault-gold/20 text-vault-gold">
                    {prompt.seller?.avatar_url ? (
                      <img src={prompt.seller.avatar_url} alt={prompt.seller.name} className="size-full object-cover" />
                    ) : (
                      <UserIcon className="size-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created by</p>
                    <p className="font-semibold">{prompt.seller?.name || "Unknown Seller"}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4" />
                    <span className="font-medium text-foreground">{prompt.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>Added {new Date(prompt.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-4">
                  <div className="flex items-end justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Price</span>
                    <span className="text-3xl font-bold text-vault-gold">₹{prompt.price}</span>
                  </div>
                  <Button
                    size="lg"
                    disabled
                    className="w-full bg-vault-gold text-vault-surface hover:bg-vault-gold/90 font-bold text-base"
                  >
                    Purchase Prompt
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Purchasing is temporarily disabled in this milestone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Prompts */}
          {relatedPrompts.length > 0 && (
            <div className="mt-24 border-t border-border pt-12">
              <h2 className="font-heading text-2xl font-semibold tracking-tight mb-8">
                More in {prompt.category?.name}
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPrompts.map((relatedPrompt) => (
                  <PromptCard key={relatedPrompt.id} prompt={relatedPrompt} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
