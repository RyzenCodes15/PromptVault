"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Settings, 
  User as UserIcon,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Listings", href: "/dashboard/listings", icon: Package },
  { name: "Create Listing", href: "/dashboard/create", icon: PlusCircle },
  { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role === "buyer") {
      router.replace("/marketplace");
    }
  }, [user, router]);

  if (!user || user.role === "buyer") return null;

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 md:hidden">
        <Link href="/" className="font-heading text-xl font-bold tracking-tight">
          PromptVault
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Sidebar (Desktop) & Drawer (Mobile) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-border bg-vault-elevated transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden h-16 items-center border-b border-border px-6 md:flex">
            <Link href="/" className="font-heading text-xl font-bold tracking-tight">
              PromptVault <span className="text-vault-gold ml-1">Seller</span>
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-vault-gold/10 text-vault-gold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className="mb-4 flex items-center gap-3 px-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="size-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-red-500"
              onClick={() => logout()}
            >
              <LogOut className="size-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className="mx-auto w-full max-w-6xl p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
