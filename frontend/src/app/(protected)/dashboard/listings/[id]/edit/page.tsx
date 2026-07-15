"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/auth-provider";
import { useCategories, usePrompt, useUpdatePrompt } from "@/hooks/use-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const editPromptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  short_description: z.string().min(10, "Short description must be at least 10 characters").max(500),
  full_description: z.string().min(10, "Full description must be at least 10 characters"),
  category_id: z.string().uuid("Please select a category"),
  price: z.number({ message: "Price must be a valid number" }).positive("Price must be a positive number"),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  prompt_file_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "deleted"]),
});

type EditPromptValues = z.infer<typeof editPromptSchema>;

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: prompt, isLoading: promptLoading } = usePrompt(params.id);
  const updatePromptMutation = useUpdatePrompt(params.id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditPromptValues>({
    resolver: zodResolver(editPromptSchema),
    defaultValues: {
      title: "",
      short_description: "",
      full_description: "",
      category_id: "",
      price: 0,
      cover_image_url: "",
      prompt_file_url: "",
      status: "inactive",
    },
  });

  useEffect(() => {
    if (prompt) {
      reset({
        title: prompt.title,
        short_description: prompt.short_description,
        full_description: prompt.full_description,
        category_id: prompt.category_id,
        price: prompt.price,
        cover_image_url: prompt.cover_image_url || "",
        prompt_file_url: prompt.prompt_file_url || "",
        status: prompt.status,
      });
    }
  }, [prompt, reset]);

  if (!user) return null;

  if (promptLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-vault-gold" />
      </div>
    );
  }

  if (!prompt || prompt.seller_id !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="size-16 text-vault-error mb-6" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Listing Not Found</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          The listing you are trying to edit does not exist or you don&apos;t have permission.
        </p>
        <Link href="/dashboard/listings">
          <Button className="mt-8 bg-vault-gold text-vault-surface hover:bg-vault-gold/90">
            Back to Listings
          </Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: EditPromptValues) => {
    setError(null);
    try {
      const payload = {
        ...data,
        cover_image_url: data.cover_image_url || undefined,
        prompt_file_url: data.prompt_file_url || undefined,
      };
      
      await updatePromptMutation.mutateAsync(payload);
      toast.success("Listing updated successfully");
      router.push("/dashboard/listings");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update prompt. Please try again.");
      } else {
        setError("Failed to update prompt. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/dashboard/listings"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Listings
      </Link>
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Edit Listing</h1>
          <p className="mt-2 text-muted-foreground">
            Update your prompt listing details.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm md:p-8">
          {error && (
            <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                    placeholder="A brief summary of what this prompt does..."
                    {...register("short_description")}
                    className={errors.short_description ? "border-red-500" : ""}
                  />
                  {errors.short_description && (
                    <p className="text-xs text-red-500">{errors.short_description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="category_id" className="text-sm font-medium leading-none">
                    Category
                  </label>
                  <Select
                    disabled={categoriesLoading}
                    onValueChange={(value) => setValue("category_id", value as string)}
                    value={watch("category_id")}
                  >
                    <SelectTrigger className={errors.category_id ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    min="0.99"
                    placeholder="9.99"
                    {...register("price", { valueAsNumber: true })}
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500">{errors.price.message}</p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="status" className="text-sm font-medium leading-none">
                    Status
                  </label>
                  <Select
                    onValueChange={(value) => setValue("status", value as "active" | "inactive" | "deleted")}
                    value={watch("status")}
                  >
                    <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inactive">Draft (Hidden)</SelectItem>
                      <SelectItem value="active">Published (Visible)</SelectItem>
                      <SelectItem value="deleted">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-xs text-red-500">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="font-heading text-xl font-bold">2. Details</h2>
              <div className="space-y-2">
                <label htmlFor="full_description" className="text-sm font-medium leading-none">
                  Full Description & Instructions
                </label>
                <Textarea
                  id="full_description"
                  placeholder="Explain exactly how to use this prompt, what parameters it takes, and what results to expect..."
                  className={`min-h-[200px] resize-y ${errors.full_description ? "border-red-500" : ""}`}
                  {...register("full_description")}
                />
                <p className="text-xs text-muted-foreground">Markdown is supported.</p>
                {errors.full_description && (
                  <p className="text-xs text-red-500">{errors.full_description.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="font-heading text-xl font-bold">3. Media & Files (Milestone 2 Placeholders)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                For now, please provide direct URLs. File uploading will be available in the next milestone.
              </p>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="cover_image_url" className="text-sm font-medium leading-none">
                    Cover Image URL (Optional)
                  </label>
                  <Input
                    id="cover_image_url"
                    placeholder="https://example.com/image.jpg"
                    {...register("cover_image_url")}
                  />
                  {errors.cover_image_url && <p className="text-sm text-red-500">{errors.cover_image_url.message}</p>}
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
                  {errors.prompt_file_url && <p className="text-sm text-red-500">{errors.prompt_file_url.message}</p>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
              <Link href="/dashboard/listings">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting || categoriesLoading}
                className="bg-vault-gold text-vault-surface hover:bg-vault-gold/90 min-w-[120px]"
              >
                {isSubmitting ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
