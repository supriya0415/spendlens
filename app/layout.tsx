import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpendLens — AI Spend Audit for Startups",
  description: "Find out exactly how much you're wasting on AI tools. Free instant audit.",
  metadataBase: new URL("https://spendlens.credex.rocks"),
  openGraph: {
    title: "SpendLens — AI Spend Audit",
    description: "Instant free audit of your AI tool spend. No login required.",
    url: "https://spendlens.credex.rocks",
    siteName: "SpendLens by Credex",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens — AI Spend Audit",
    description: "Find out how much your startup is wasting on AI tools.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'DM Sans', system-ui, sans-serif", background: "#0a0a0f", color: "#f0f0f5" }}>
        {children}
      </body>
    </html>
  );
}
