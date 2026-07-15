"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { ProfileContent } from "@/components/profile/profile-content";
import { useAuth } from "@/providers/auth-provider";

export default function BuyerProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role === "seller") {
      router.replace("/dashboard/profile");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;
  if (user.role === "seller") return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 md:py-12 flex justify-center">
        <ProfileContent />
      </main>
    </div>
  );
}
