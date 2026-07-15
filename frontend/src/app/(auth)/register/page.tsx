"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Vault } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["buyer", "seller"]),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      // 1. Register
      await api.post("/api/auth/register", data);
      
      // 2. Login
      const loginResponse = await api.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      });
      
      // 3. Save token & redirect
      await login(loginResponse.access_token);
    } catch (err: unknown) {
      setError((err as Error).message || "Registration failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col items-center justify-center py-20">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-vault-elevated p-8 shadow-lg">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-background border border-border">
              <Vault className="size-6 text-vault-gold" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Join PromptVault to buy and sell premium AI prompts</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("role", "buyer")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                    selectedRole === "buyer"
                      ? "border-vault-gold bg-vault-gold/10 text-vault-gold"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <span className="font-medium">Buyer</span>
                  <span className="text-xs mt-1 opacity-80">I want to buy prompts</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "seller")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-4 transition-all ${
                    selectedRole === "seller"
                      ? "border-vault-gold bg-vault-gold/10 text-vault-gold"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <span className="font-medium">Seller</span>
                  <span className="text-xs mt-1 opacity-80">I want to sell prompts</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="John Doe"
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email address</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-foreground text-background hover:bg-vault-gold hover:text-background"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:text-vault-gold">
              Sign in
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
