"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Camera, User as UserIcon } from "lucide-react";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().nullable(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    setError(null);
    setSuccess(null);
    try {
      const updated = await api.put("/api/users/profile", data);
      updateUser(updated);
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to update profile.");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const updatedUser = await api.postFormData("/api/users/avatar", formData);
      updateUser(updatedUser);
      setSuccess("Avatar updated successfully!");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to upload avatar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!user) return null; // Wait for redirect in AuthProvider

  return (
    <div className="w-full max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Public Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your public seller profile details.</p>
      </div>

      <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm md:p-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-md bg-green-500/10 p-3 text-sm text-green-500">
            {success}
          </div>
        )}

        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-background">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="size-full object-cover" />
              ) : (
                <UserIcon className="size-12 text-muted-foreground" />
              )}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                  <Loader2 className="size-6 animate-spin text-vault-gold" />
                </div>
              )}
            </div>
            
            <div>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleAvatarUpload}
              />
              <Button 
                variant="outline" 
                size="sm"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="size-4" />
                Change Avatar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              JPG, PNG or GIF. Max 5MB.
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bio (Optional)</label>
                <Textarea
                  {...register("bio")}
                  placeholder="Tell the community about yourself..."
                  className={`min-h-[120px] resize-none ${errors.bio ? "border-red-500" : ""}`}
                />
                {errors.bio && (
                  <p className="text-xs text-red-500">{errors.bio.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="bg-vault-gold text-background hover:bg-vault-gold/90"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
