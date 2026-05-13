import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, company, role, auditId, monthlySaving } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Store lead
    if (supabase) {
      await supabase.from("leads").insert({
        email,
        company: company || null,
        role: role || null,
        audit_id: auditId || null,
        monthly_saving: monthlySaving || 0,
        created_at: new Date().toISOString(),
      });
    }

    // Send confirmation email via Resend (if configured)
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SpendLens by Credex <audit@credex.rocks>",
          to: [email],
          subject: `Your AI Spend Audit — $${monthlySaving}/mo in savings identified`,
          html: `
            <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:2rem">
              <h2 style="color:#7c6af5">Your AI Spend Audit is ready</h2>
              <p>We identified <strong>$${monthlySaving}/month ($${(monthlySaving * 12).toLocaleString()}/year)</strong> in potential savings across your AI tool stack.</p>
              <p>View your full audit: <a href="https://spendlens.credex.rocks/audit/${auditId}">spendlens.credex.rocks/audit/${auditId}</a></p>
              ${
                monthlySaving > 500
                  ? `<div style="background:#f0edff;border-radius:8px;padding:1rem;margin-top:1rem">
                      <strong>You qualify for a Credex consultation.</strong><br/>
                      We source discounted AI credits — same tools, up to 40% less. Reply to this email or <a href="https://credex.rocks">book a call</a>.
                    </div>`
                  : ""
              }
              <p style="color:#888;font-size:12px;margin-top:2rem">SpendLens by Credex · credex.rocks · Unsubscribe anytime by replying STOP</p>
            </div>
          `,
        }),
      });
      if (!res.ok) console.error("Resend error:", await res.text());
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Lead error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
