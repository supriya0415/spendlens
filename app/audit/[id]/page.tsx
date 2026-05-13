import { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `AI Spend Audit ${id} — SpendLens`,
    description: "View this AI spend audit and see where your team could save on AI tools.",
    openGraph: {
      title: "AI Spend Audit — SpendLens by Credex",
      description: "See where this team is overspending on AI tools and what they could save.",
      images: [{ url: `/api/og?id=${id}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function AuditPage({ params }: Props) {
  const { id } = await params;

  return (
    <div style={{ background: "#0a0a0f", color: "#f0f0f5", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid #2e2e45", background: "#13131a" }}>
        <div style={{ fontWeight: 600, fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00d4a0", display: "inline-block" }} />
          SpendLens
        </div>
        <Link href="/" style={{ background: "#7c6af5", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
          Run your own audit →
        </Link>
      </nav>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", color: "#7c6af5", textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>
          Shared Audit · {id}
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 300, marginBottom: 16 }}>
          This audit has been shared with you
        </h1>
        <p style={{ color: "#a0a0b8", fontSize: "1rem", lineHeight: 1.7, marginBottom: 32 }}>
          This is a shared AI spend audit result. The full interactive version requires running a new audit — which is free and takes under 60 seconds.
        </p>
        <Link href="/" style={{ display: "inline-block", background: "linear-gradient(135deg,#7c6af5,#5c4ed4)", color: "#fff", borderRadius: 12, padding: "14px 32px", fontSize: "1rem", fontWeight: 600, textDecoration: "none" }}>
          Run your own free audit →
        </Link>
        <p style={{ color: "#6060a0", fontSize: 12, marginTop: 16 }}>
          No login required · 8 AI tools supported · Free forever
        </p>
      </div>
    </div>
  );
}
