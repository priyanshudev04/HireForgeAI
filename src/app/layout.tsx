import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { AppProviders } from "@/providers"

import "./globals.css"

/* ── Fonts ────────────────────────────────────────────────── */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
})

/* ── Metadata (PRD Part 5 — Landing) ─────────────────────── */
export const metadata: Metadata = {
  title: {
    default: "HireForge AI — Your AI Career Operating System",
    template: "%s | HireForge AI",
  },
  description:
    "HireForge AI is an AI-powered career preparation platform for students and professionals. Master DSA, ace mock interviews, build your resume, and track your placement-readiness — all in one place.",
  keywords: [
    "placement preparation",
    "DSA practice",
    "mock interviews",
    "AI career coaching",
    "resume builder",
    "HireScore",
    "coding interview prep",
  ],
  authors: [{ name: "HireForge AI" }],
  creator: "HireForge AI",
  metadataBase: new URL("https://hireforge.ai"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hireforge.ai",
    siteName: "HireForge AI",
    title: "HireForge AI — Your AI Career Operating System",
    description:
      "AI-powered placement preparation: DSA, mock interviews, resume builder, roadmap, and analytics — built for students and working professionals.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HireForge AI — Your AI Career Operating System",
    description:
      "AI-powered placement preparation: DSA, mock interviews, resume builder, roadmap, and analytics.",
    creator: "@hireforgeai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

/* ── Root Layout ──────────────────────────────────────────── */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      /**
       * suppressHydrationWarning is required by next-themes:
       * the server renders the html element without a theme class;
       * next-themes adds it on the client before React hydrates.
       * This attribute prevents the "text content differs" warning.
       */
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
