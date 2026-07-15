"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useCategories, useCreatePrompt } from "@/hooks/use-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const createPromptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  short_description: z.string().min(10, "Short description must be at least 10 characters").max(500),
  full_description: z.string().min(10, "Full description must be at least 10 characters"),
  category_id: z.string().uuid("Please select a category"),
  price: z.number({ message: "Price must be a valid number" }).positive("Price must be a positive number"),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  prompt_text: z.string().min(1, "Prompt text is required"),
});

type CreatePromptValues = z.infer<typeof createPromptSchema>;

export default function CreateListingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createPromptMutation = useCreatePrompt();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
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
      prompt_text: "",
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const coverImageUrl = watch("cover_image_url");

  if (!user) return null;

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("accessToken");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const res = await fetch(`${API_BASE_URL}/api/prompts/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const responseData = await res.json();
      setValue("cover_image_url", responseData.url, { shouldValidate: true });
    } catch (err) {
      console.error(err);
      setError("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: CreatePromptValues) => {
    setError(null);
    try {
      const payload = {
        ...data,
        cover_image_url: data.cover_image_url || undefined,
      };

      await createPromptMutation.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["seller-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-prompts-overview"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      router.push("/dashboard/listings");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to create listing. Please try again.");
      } else {
        setError("Failed to create listing. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/dashboard"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Create Listing</h1>
          <p className="mt-2 text-muted-foreground">
            Sell your prompt to thousands of creators on PromptVault.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm md:p-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* 1. Basic Info */}
            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold">1. Basic Info</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="title" className="text-sm font-medium leading-none">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. Midjourney Portrait Photography Masterclass"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="short_description" className="text-sm font-medium leading-none">
                    Short Description
                  </label>
                  <Input
                    id="short_description"
                    placeholder="A concise summary (10-500 characters)"
                    {...register("short_description")}
                    className={errors.short_description ? "border-red-500" : ""}
                  />
                  {errors.short_description && (
                    <p className="text-xs text-red-500">{errors.short_description.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="full_description" className="text-sm font-medium leading-none">
                    Full Description
                  </label>
                  <Textarea
                    id="full_description"
                    placeholder="Provide detailed information about what this prompt does and how to use it..."
                    className={`min-h-[160px] resize-y ${errors.full_description ? "border-red-500" : ""}`}
                    {...register("full_description")}
                  />
                  <p className="text-xs text-muted-foreground">Markdown is supported.</p>
                  {errors.full_description && (
                    <p className="text-xs text-red-500">{errors.full_description.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Category & Pricing */}
            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="font-heading text-xl font-bold">2. Category & Pricing</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="category_id" className="text-sm font-medium leading-none">
                    Category
                  </label>
                  <select
                    id="category_id"
                    disabled={categoriesLoading}
                    {...register("category_id")}
                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.category_id ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="text-xs text-red-500">{errors.category_id.message}</p>
                  )}
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
                    placeholder="29.99"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500">{errors.price.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Media & Prompt Details */}
            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="font-heading text-xl font-bold">3. Media & Prompt Details</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Upload a cover image and provide the prompt text.
              </p>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium leading-none">Example Output Image</label>
                  <div className="flex flex-col gap-4">
                    {coverImageUrl && (
                      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImageUrl} alt="Cover Preview" className="size-full object-cover" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                        {coverImageUrl ? "Change Image" : "Upload Image"}
                      </Button>
                    </div>
                  </div>
                  {errors.cover_image_url && (
                    <p className="text-sm text-red-500">{errors.cover_image_url.message}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="prompt_text" className="text-sm font-medium leading-none">
                    Prompt Text
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Enter the exact prompt text that the buyer will receive. Formatting is preserved.
                  </p>
                  <Textarea
                    id="prompt_text"
                    placeholder={"Enter the exact prompt text that the buyer will receive…\n\nYou can use multiple lines, variables like {{topic}}, and any special formatting.\n\nThis text will be hidden until the buyer completes their purchase."}
                    className={`min-h-[250px] resize-y font-mono text-sm leading-relaxed ${
                      errors.prompt_text ? "border-red-500" : ""
                    }`}
                    {...register("prompt_text")}
                  />
                  {errors.prompt_text && (
                    <p className="text-sm text-red-500">{errors.prompt_text.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 border-t border-border pt-6">
              <Link href="/dashboard">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || categoriesLoading}
                className="min-w-[120px] bg-vault-gold text-vault-surface hover:bg-vault-gold/90"
              >
                {isSubmitting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                {isSubmitting ? "Creating..." : "Publish Listing"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
