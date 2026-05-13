import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runAuditEngine, ToolEntry } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entries, teamSize, useCase } = body as {
      entries: ToolEntry[];
      teamSize: number;
      useCase: string;
    };

    if (!entries?.length) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }

    const summary = runAuditEngine(entries, teamSize, useCase);
    const auditId = generateId();

    // Generate AI summary
    let aiSummary = "";
    try {
      const toolList = summary.results
        .map(
          (r) =>
            `${r.toolName} (${r.planName}, $${r.currentSpend}/mo${
              r.monthlySaving > 0 ? `, save $${r.monthlySaving}` : ", optimal"
            })`
        )
        .join("; ");

      const prompt = `You are a sharp AI spend analyst. A ${teamSize}-person startup has completed an AI tool audit. Their primary use case is ${useCase}.

Tools audited: ${toolList}
Total monthly spend: $${summary.totalCurrentSpend}
Total potential monthly savings: $${summary.totalMonthlySaving}

Write a personalized 80-100 word summary paragraph. Be specific, direct, and insightful. Sound like a smart CFO giving quick advice — not a sales pitch. Highlight the biggest opportunity. If savings are low, acknowledge they're well-optimized and give one forward-looking tip.

Write only the paragraph. No preamble, no sign-off.`;

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 200,
        messages: [{ role: "user", content: prompt }],
      });

      aiSummary =
        message.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("") ?? "";
    } catch {
      // Fallback template
      const topSaver = summary.results
        .filter((r) => r.monthlySaving > 0)
        .sort((a, b) => b.monthlySaving - a.monthlySaving)[0];

      aiSummary =
        summary.totalMonthlySaving > 0
          ? `Your ${teamSize}-person team is spending $${summary.totalCurrentSpend}/mo across ${summary.results.length} AI tools. We found $${summary.totalMonthlySaving}/mo ($${summary.totalAnnualSaving.toLocaleString()}/yr) in savings. ${topSaver ? `The biggest opportunity is ${topSaver.toolName} — ${topSaver.savingsReason}` : ""} Focus on the highlighted recommendations for quick wins.`
          : `Your ${teamSize}-person team is spending $${summary.totalCurrentSpend}/mo across ${summary.results.length} AI tools — and it's actually well-optimized. No major overspend detected. As you scale, revisit plan tiers quarterly and watch API usage closely.`;
    }

    // Persist to Supabase
    if (supabase) {
      await supabase.from("audits").insert({
        id: auditId,
        team_size: teamSize,
        use_case: useCase,
        total_monthly_spend: summary.totalCurrentSpend,
        total_monthly_saving: summary.totalMonthlySaving,
        results: summary.results,
        ai_summary: aiSummary,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      auditId,
      summary,
      aiSummary,
    });
  } catch (err) {
    console.error("Audit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
