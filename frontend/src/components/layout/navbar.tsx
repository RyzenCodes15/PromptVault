/**
 * Sticky navigation bar with subtle backdrop blur.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Vault, User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HealthIndicator } from "@/components/shared/health-indicator";
import { useAuth } from "@/providers/auth-provider";

const NAV_LINKS = [
  { label: "Marketplace", href: "/marketplace" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-vault-elevated">
            <Vault className="size-4 text-vault-gold" />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight">
            PromptVault
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <>
              <Link href="/#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Features</Link>
              <Link href="/#why" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">Why PromptVault</Link>
            </>
          )}
          <HealthIndicator />
          
          {!loading && (
            user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-border bg-background p-1 pl-3 pr-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <span>{user.name}</span>
                  <div className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-vault-gold/20 text-vault-gold">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="size-full object-cover" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </div>
                </button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-background shadow-lg"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                        <div className="mt-2 inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-semibold capitalize text-foreground">
                          {user.role}
                        </div>
                      </div>
                      <div className="p-1">
                        <Link 
                          href={user.role === 'buyer' ? '/marketplace' : '/dashboard'}
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="size-4" />
                          Dashboard
                        </Link>
                        <Link 
                          href="/profile"
                          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Settings className="size-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <LogOut className="size-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Login
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-foreground text-background transition-colors hover:bg-vault-gold hover:text-background"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-background/95 backdrop-blur-md md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6 py-4">
              <HealthIndicator />
              {!loading && (
                user ? (
                  <>
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-vault-gold/20 text-vault-gold">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="size-full object-cover" />
                        ) : (
                          <User className="size-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/marketplace"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Marketplace
                    </Link>
                    <Link 
                      href={user.role === 'buyer' ? '/marketplace' : '/dashboard'}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="text-left text-sm font-medium text-red-500 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/marketplace" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                      Marketplace
                    </Link>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-foreground text-background transition-colors hover:bg-vault-gold hover:text-background">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
