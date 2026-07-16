"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Loader2, AlertCircle, Plus, X, ArrowUp, ArrowDown } from "lucide-react";

import { useAuth } from "@/providers/auth-provider";
import { useCategories, usePrompt, useUpdatePrompt } from "@/hooks/use-marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const editPromptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  short_description: z.string().min(10, "Short description must be at least 10 characters").max(500),
  full_description: z.string().min(10, "Full description must be at least 10 characters"),
  category_id: z.string().uuid("Please select a category"),
  price: z.number({ message: "Price must be a valid number" }).positive("Price must be a positive number"),
  cover_image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  additional_images: z.array(z.string().url()).optional(),
  prompt_text: z.string().min(1, "Prompt text is required"),
  status: z.enum(["active", "inactive", "deleted"]),
});

type EditPromptValues = z.infer<typeof editPromptSchema>;

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: prompt, isLoading: promptLoading } = usePrompt(params.id);
  const updatePromptMutation = useUpdatePrompt(params.id);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
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
      additional_images: [],
      prompt_text: "",
      status: "inactive",
    },
  });

  useEffect(() => {
    if (prompt) {
      reset({
        title: prompt.title,
        short_description: prompt.short_description,
        full_description: prompt.full_description,
        category_id: prompt.category_id || prompt.category?.id || "",
        price: prompt.price,
        cover_image_url: prompt.cover_image_url || "",
        additional_images: prompt.additional_images || [],
        prompt_text: prompt.prompt_text || "",
        status: prompt.status,
      });
    }
  }, [prompt, reset]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const coverImageUrl = watch("cover_image_url");
  const additionalImages = watch("additional_images") || [];

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
        <AlertCircle className="mb-6 size-16 text-red-500" />
        <h1 className="font-heading text-2xl font-bold tracking-tight">Listing Not Found</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
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

  const handleAdditionalImagesUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingAdditional(true);
      setError(null);
      const token = localStorage.getItem("accessToken");
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch(`${API_BASE_URL}/api/prompts/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload gallery image");
        }
        const responseData = await res.json();
        if (responseData.url) {
          uploadedUrls.push(responseData.url);
        }
      }

      const currentImages = getValues("additional_images") || [];
      setValue("additional_images", [...currentImages, ...uploadedUrls], { shouldValidate: true });
    } catch (err) {
      console.error(err);
      setError("Failed to upload one or more gallery images.");
    } finally {
      setIsUploadingAdditional(false);
      if (additionalFileInputRef.current) {
        additionalFileInputRef.current.value = "";
      }
    }
  };

  const removeAdditionalImage = (indexToRemove: number) => {
    const currentImages = getValues("additional_images") || [];
    setValue(
      "additional_images",
      currentImages.filter((_, idx) => idx !== indexToRemove),
      { shouldValidate: true }
    );
  };

  const moveAdditionalImage = (index: number, direction: "up" | "down") => {
    const currentImages = [...(getValues("additional_images") || [])];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[index];
    currentImages[index] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;
    setValue("additional_images", currentImages, { shouldValidate: true });
  };

  const onSubmit = async (data: EditPromptValues) => {
    setError(null);
    try {
      const payload = {
        ...data,
        cover_image_url: data.cover_image_url || undefined,
        additional_images: data.additional_images || [],
      };

      await updatePromptMutation.mutateAsync(payload);
      queryClient.invalidateQueries({ queryKey: ["seller-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["seller-prompts-overview"] });
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      toast.success("Listing updated successfully");
      router.push("/dashboard/listings");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to update listing. Please try again.");
      } else {
        setError("Failed to update listing. Please try again.");
      }
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <Link
        href="/dashboard/listings"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Listings
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Edit Listing</h1>
          <p className="mt-2 text-muted-foreground">
            Update your listing details, pricing, and prompt text.
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

            {/* 2. Category, Pricing & Status */}
            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="font-heading text-xl font-bold">2. Category, Pricing & Status</h2>
              <div className="grid gap-6 md:grid-cols-3">
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

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium leading-none">
                    Status
                  </label>
                  <select
                    id="status"
                    {...register("status")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="active">Published (Active)</option>
                    <option value="inactive">Draft (Inactive)</option>
                    <option value="deleted">Archived (Deleted)</option>
                  </select>
                  {errors.status && (
                    <p className="text-xs text-red-500">{errors.status.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Media & Prompt Details */}
            <div className="space-y-6 border-t border-border pt-6">
              <h2 className="font-heading text-xl font-bold">3. Media & Prompt Details</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Update cover image and prompt text.
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

                <div className="space-y-3 md:col-span-2 border-t border-border/50 pt-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label className="text-sm font-medium leading-none">Additional Images (Product Gallery)</label>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Upload secondary example images or screenshots. Reorder using ↑ / ↓ buttons.
                      </p>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        ref={additionalFileInputRef}
                        onChange={handleAdditionalImagesUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => additionalFileInputRef.current?.click()}
                        disabled={isUploadingAdditional}
                      >
                        {isUploadingAdditional ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
                        Add Gallery Images
                      </Button>
                    </div>
                  </div>

                  {additionalImages.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {additionalImages.map((url, index) => (
                        <div key={`${url}-${index}`} className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Gallery ${index + 1}`} className="size-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => moveAdditionalImage(index, "up")}
                              disabled={index === 0}
                              className="rounded bg-vault-surface/80 p-1.5 text-foreground hover:bg-vault-surface disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveAdditionalImage(index, "down")}
                              disabled={index === additionalImages.length - 1}
                              className="rounded bg-vault-surface/80 p-1.5 text-foreground hover:bg-vault-surface disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="rounded bg-red-500/80 p-1.5 text-white hover:bg-red-600"
                              title="Remove"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-24 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-xs text-muted-foreground">
                      No additional gallery images uploaded yet.
                    </div>
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
              <Link href="/dashboard/listings">
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
                {isSubmitting ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
