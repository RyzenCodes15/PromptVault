import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PromptVault — The AI Prompt Marketplace",
  description:
    "Discover, buy, and sell expertly crafted prompts for AI image generation. Join thousands of creators on the premier prompt marketplace.",
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
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
