"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, Trash2, Key } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user.email) {
      toast.error("Email does not match. Account deletion cancelled.");
      return;
    }

    setIsDeleting(true);
    try {
      await api.delete("/api/users/me");
      toast.success("Account deleted successfully.");
      logout();
      router.push("/");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your security preferences and account status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Security Section (Placeholder) */}
        <div className="rounded-2xl border border-border bg-vault-elevated p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <Key className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold">Security</h2>
              <p className="text-sm text-muted-foreground">Manage your password and authentication.</p>
            </div>
          </div>
          
          <div className="space-y-4 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              Password management and 2FA will be available in the upcoming security milestone.
            </p>
            <Button variant="outline" disabled>
              Change Password
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 shadow-sm md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-red-500">Danger Zone</h2>
              <p className="text-sm text-red-500/80">Irreversible account actions.</p>
            </div>
          </div>
          
          <div className="space-y-4 border-t border-red-500/20 pt-6">
            <h3 className="font-medium text-red-500">Delete Account</h3>
            <p className="text-sm text-red-500/80">
              Once you delete your account, there is no going back. Please be certain.
              All your prompts will be permanently removed from the marketplace.
            </p>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="mr-2 size-4" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="border-red-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <p>
                This action <strong>cannot</strong> be undone. This will permanently delete your
                account and remove your data from our servers.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Please type <strong>{user.email}</strong> to confirm.
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={user.email}
                  className="border-red-500/50 focus-visible:ring-red-500"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleteConfirmation !== user.email || isDeleting}
              className="bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
