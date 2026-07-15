"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/providers/auth-provider";
import { useCategories, useCreatePrompt } from "@/hooks/use-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const createPromptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  short_description: z.string().min(10, "Short description must be at least 10 characters").max(500),
  full_description: z.string().min(10, "Full description must be at least 10 characters"),
  category_id: z.string().uuid("Please select a category"),
  price: z.number({ message: "Price must be a valid number" }).positive("Price must be a positive number"),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  prompt_file_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CreatePromptValues = z.infer<typeof createPromptSchema>;

export default function CreatePromptPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createPromptMutation = useCreatePrompt();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePromptValues>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      short_description: "",
      full_description: "",
      category_id: "",
      price: 0,
      cover_image_url: "",
      prompt_file_url: "",
    },
  });

  if (!user) return null;

  // Protect route: only sellers can create prompts
  if (user.role !== "seller") {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen flex-col items-center justify-center pt-16 px-6 text-center">
          <AlertCircle className="size-16 text-vault-error mb-6" />
          <h1 className="font-heading text-2xl font-bold tracking-tight">Access Denied</h1>
          <p className="mt-2 text-muted-foreground max-w-md">
            Only registered sellers can create prompts in the marketplace.
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

  const onSubmit = async (data: CreatePromptValues) => {
    setError(null);
    try {
      // Convert empty strings to undefined to match Optional fields in API
      const payload = {
        ...data,
        cover_image_url: data.cover_image_url || undefined,
        prompt_file_url: data.prompt_file_url || undefined,
      };
      
      const newPrompt = await createPromptMutation.mutateAsync(payload);
      router.push(`/prompt/${newPrompt.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create prompt. Please try again.");
      } else {
        setError("Failed to create prompt. Please try again.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col pt-24 pb-16">
        <div className="mx-auto w-full max-w-3xl px-6">
          <Link
            href="/dashboard"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>

          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Create a New Prompt</h1>
            <p className="mt-2 text-muted-foreground">
              Fill out the details below to list your prompt on the marketplace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8 rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm md:p-8">
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-vault-error/50 bg-vault-error/10 p-4 text-sm text-vault-error">
                <AlertCircle className="size-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="e.g. Masterful Midjourney Architecture Generator"
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-vault-error">{errors.title.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="short_description" className="text-sm font-medium leading-none">
                  Short Description
                </label>
                <Textarea
                  id="short_description"
                  placeholder="A brief 1-2 sentence summary of what this prompt does..."
                  className="resize-none min-h-[80px]"
                  {...register("short_description")}
                />
                {errors.short_description && <p className="text-sm text-vault-error">{errors.short_description.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="full_description" className="text-sm font-medium leading-none">
                  Full Description
                </label>
                <Textarea
                  id="full_description"
                  placeholder="Explain in detail how this prompt works, what inputs are required, and what results buyers can expect..."
                  className="min-h-[200px]"
                  {...register("full_description")}
                />
                {errors.full_description && <p className="text-sm text-vault-error">{errors.full_description.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="category_id" className="text-sm font-medium leading-none">
                  Category
                </label>
                <select
                  id="category_id"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("category_id")}
                >
                  <option value="">Select a category...</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && <p className="text-sm text-vault-error">{errors.category_id.message}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium leading-none">
                  Price (₹)
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="9.99"
                  {...register("price", { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-vault-error">{errors.price.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2 pt-6 border-t border-border">
                <h3 className="text-lg font-medium">Media & Files (Milestone 2 Placeholders)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  For now, please provide direct URLs. File uploading will be available in the next milestone.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="cover_image_url" className="text-sm font-medium leading-none">
                  Cover Image URL (Optional)
                </label>
                <Input
                  id="cover_image_url"
                  placeholder="https://example.com/image.jpg"
                  {...register("cover_image_url")}
                />
                {errors.cover_image_url && <p className="text-sm text-vault-error">{errors.cover_image_url.message}</p>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="prompt_file_url" className="text-sm font-medium leading-none">
                  Prompt File URL (Optional)
                </label>
                <Input
                  id="prompt_file_url"
                  placeholder="https://example.com/prompt.txt"
                  {...register("prompt_file_url")}
                />
                {errors.prompt_file_url && <p className="text-sm text-vault-error">{errors.prompt_file_url.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Link href="/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || categoriesLoading}
                className="bg-vault-gold text-vault-surface hover:bg-vault-gold/90 min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : "Create Prompt"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
