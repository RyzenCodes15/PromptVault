import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PromptVault — The Premier Prompt Marketplace",
  description:
    "Discover, buy, and sell expertly crafted prompts for AI image generation. A premium marketplace built for creators who value quality.",
  keywords: [
    "AI prompts",
    "prompt marketplace",
    "AI art",
    "Midjourney prompts",
    "DALL-E prompts",
    "Stable Diffusion prompts",
    "prompt engineering",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
