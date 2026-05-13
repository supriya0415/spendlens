// PRICING_DATA — verified May 2025
// Every price traces to official vendor pricing pages

export interface Plan {
  name: string;
  pricePerUser: number;  // monthly, per seat
  flatPrice?: number;    // monthly flat (not per-seat)
  source: string;
}

export interface Tool {
  id: string;
  name: string;
  icon: string;
  plans: Plan[];
}

export const TOOLS: Tool[] = [
  {
    id: "cursor",
    name: "Cursor",
    icon: "⌨️",
    plans: [
      { name: "Hobby", pricePerUser: 0, source: "https://cursor.sh/pricing" },
      { name: "Pro", pricePerUser: 20, source: "https://cursor.sh/pricing" },
      { name: "Business", pricePerUser: 40, source: "https://cursor.sh/pricing" },
      { name: "Enterprise", pricePerUser: 80, source: "https://cursor.sh/pricing" },
    ],
  },
  {
    id: "github_copilot",
    name: "GitHub Copilot",
    icon: "🐙",
    plans: [
      { name: "Individual", pricePerUser: 10, source: "https://github.com/features/copilot#pricing" },
      { name: "Business", pricePerUser: 19, source: "https://github.com/features/copilot#pricing" },
      { name: "Enterprise", pricePerUser: 39, source: "https://github.com/features/copilot#pricing" },
    ],
  },
  {
    id: "claude",
    name: "Claude",
    icon: "🟠",
    plans: [
      { name: "Free", pricePerUser: 0, source: "https://claude.ai/pricing" },
      { name: "Pro", pricePerUser: 20, flatPrice: 20, source: "https://claude.ai/pricing" },
      { name: "Max", pricePerUser: 100, flatPrice: 100, source: "https://claude.ai/pricing" },
      { name: "Team", pricePerUser: 30, source: "https://claude.ai/pricing" },
      { name: "Enterprise", pricePerUser: 60, source: "https://claude.ai/pricing" },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "🟢",
    plans: [
      { name: "Free", pricePerUser: 0, source: "https://openai.com/chatgpt/pricing" },
      { name: "Plus", pricePerUser: 20, flatPrice: 20, source: "https://openai.com/chatgpt/pricing" },
      { name: "Team", pricePerUser: 30, source: "https://openai.com/chatgpt/pricing" },
      { name: "Enterprise", pricePerUser: 60, source: "https://openai.com/chatgpt/pricing" },
    ],
  },
  {
    id: "anthropic_api",
    name: "Anthropic API",
    icon: "🔷",
    plans: [
      { name: "Pay-as-you-go", pricePerUser: 0, source: "https://www.anthropic.com/pricing" },
    ],
  },
  {
    id: "openai_api",
    name: "OpenAI API",
    icon: "🔵",
    plans: [
      { name: "Pay-as-you-go", pricePerUser: 0, source: "https://openai.com/api/pricing" },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "💎",
    plans: [
      { name: "Free", pricePerUser: 0, source: "https://gemini.google.com/advanced" },
      { name: "Advanced", pricePerUser: 20, flatPrice: 20, source: "https://one.google.com/about/plans" },
      { name: "Ultra", pricePerUser: 30, flatPrice: 30, source: "https://one.google.com/about/plans" },
      { name: "API", pricePerUser: 0, source: "https://ai.google.dev/pricing" },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    icon: "🏄",
    plans: [
      { name: "Free", pricePerUser: 0, source: "https://codeium.com/pricing" },
      { name: "Pro", pricePerUser: 15, source: "https://codeium.com/pricing" },
      { name: "Teams", pricePerUser: 35, source: "https://codeium.com/pricing" },
    ],
  },
];

export interface ToolEntry {
  toolId: string;
  planName: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditResult {
  toolId: string;
  toolName: string;
  icon: string;
  planName: string;
  seats: number;
  currentSpend: number;
  recommendedAction: string;
  alternativeName?: string;
  projectedSpend: number;
  monthlySaving: number;
  isOptimal: boolean;
  savingsReason: string;
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySaving: number;
  totalAnnualSaving: number;
  totalCurrentSpend: number;
  teamSize: number;
  useCase: string;
}

export function runAuditEngine(entries: ToolEntry[], teamSize: number, useCase: string): AuditSummary {
  const results: AuditResult[] = entries.map((entry) => {
    const tool = TOOLS.find((t) => t.id === entry.toolId)!;
    const plan = tool.plans.find((p) => p.name === entry.planName) ?? tool.plans[0];

    let recommendedAction = "";
    let alternativeName: string | undefined;
    let projectedSpend = entry.monthlySpend;
    let isOptimal = false;
    let savingsReason = "";

    // === CURSOR ===
    if (tool.id === "cursor") {
      if (plan.name === "Pro" && entry.seats <= 3) {
        isOptimal = true;
        recommendedAction = "Cursor Pro is well-priced for small teams of ≤3 developers.";
        savingsReason = "Plan fits usage.";
      } else if (plan.name === "Business" && entry.seats >= 5) {
        const altCost = 19 * entry.seats; // GitHub Copilot Business
        if (altCost < entry.monthlySpend) {
          projectedSpend = altCost;
          alternativeName = "GitHub Copilot Business";
          recommendedAction = `Switch to GitHub Copilot Business at $19/user/mo. For ${entry.seats} seats that's $${altCost}/mo vs your current $${entry.monthlySpend}/mo.`;
          savingsReason = "Copilot Business covers most Cursor use cases at lower per-seat cost for larger teams.";
        } else {
          isOptimal = true;
          recommendedAction = "Cursor Business is competitive at your team size.";
          savingsReason = "Plan fits usage.";
        }
      } else if (plan.name === "Enterprise") {
        const altCost = 40 * entry.seats;
        projectedSpend = altCost;
        alternativeName = "Cursor Business";
        recommendedAction = `Downgrade to Cursor Business at $40/user/mo ($${altCost}/mo for ${entry.seats} seats). Enterprise adds SSO + audit logs — only needed for compliance-heavy orgs.`;
        savingsReason = "Business plan covers 90% of Enterprise features.";
      } else {
        isOptimal = true;
        recommendedAction = "Plan looks well-matched to your team size.";
        savingsReason = "No immediate savings identified.";
      }
    }

    // === GITHUB COPILOT ===
    else if (tool.id === "github_copilot") {
      if (plan.name === "Individual" && entry.seats > 1) {
        const bizCost = 19 * entry.seats;
        const indCost = 10 * entry.seats;
        recommendedAction = `Move from multiple Individual plans to a single Business plan at $19/user/mo ($${bizCost}/mo). Adds admin controls, policy enforcement, and is required for org-level billing.`;
        projectedSpend = bizCost;
        alternativeName = "GitHub Copilot Business";
        savingsReason = "Individual plans can't be centrally managed; Business is the right choice for teams.";
        if (bizCost >= indCost) { isOptimal = true; projectedSpend = entry.monthlySpend; }
      } else if (plan.name === "Enterprise") {
        const altCost = 19 * entry.seats;
        projectedSpend = altCost;
        alternativeName = "GitHub Copilot Business";
        recommendedAction = `Downgrade to Copilot Business at $19/user/mo ($${altCost}/mo). Enterprise ($39/user) adds Copilot Workspace + Enterprise Support — only worthwhile if you actively use those features.`;
        savingsReason = "Most teams don't use Enterprise-exclusive features.";
      } else {
        isOptimal = true;
        recommendedAction = "GitHub Copilot Business is well-priced for dev teams. No change recommended.";
        savingsReason = "Plan is already optimal.";
      }
    }

    // === CLAUDE ===
    else if (tool.id === "claude") {
      if (plan.name === "Max") {
        const altCost = 20; // Claude Pro
        projectedSpend = altCost;
        alternativeName = "Claude Pro";
        recommendedAction = "Downgrade from Max ($100/mo) to Pro ($20/mo) unless you're consistently hitting Pro's output limits every day. Max is for extreme-usage power users only.";
        savingsReason = "Max is 5× the cost of Pro for marginal usage gains for most users.";
      } else if (plan.name === "Enterprise" && entry.seats <= 10) {
        const altCost = 30 * entry.seats;
        projectedSpend = altCost;
        alternativeName = "Claude Team";
        recommendedAction = `Switch to Claude Team at $30/user/mo ($${altCost}/mo for ${entry.seats} seats). Enterprise adds compliance, SSO, and dedicated support — unnecessary for most small-to-mid teams.`;
        savingsReason = "Team plan covers all core collaborative features.";
      } else {
        isOptimal = true;
        recommendedAction = plan.name === "Free" ? "You're on the free plan. If usage is growing, Claude Pro at $20/mo adds significantly more capacity." : "Claude plan looks appropriate for your team size and usage.";
        savingsReason = "Plan fits usage.";
      }
    }

    // === CHATGPT ===
    else if (tool.id === "chatgpt") {
      if (plan.name === "Enterprise" && entry.seats <= 15) {
        const altCost = 30 * entry.seats;
        projectedSpend = altCost;
        alternativeName = "ChatGPT Team";
        recommendedAction = `Switch to ChatGPT Team at $30/user/mo ($${altCost}/mo for ${entry.seats} seats). Enterprise adds compliance + SSO — overkill for most teams under 20 people.`;
        savingsReason = "Team plan is the right tier for most growing startups.";
      } else {
        isOptimal = true;
        recommendedAction = plan.name === "Plus" ? "ChatGPT Plus ($20/mo) is solid value for individual power users." : "ChatGPT Team is well-priced for collaborative teams.";
        savingsReason = "No immediate savings identified.";
      }
    }

    // === ANTHROPIC API / OPENAI API ===
    else if (tool.id === "anthropic_api" || tool.id === "openai_api") {
      if (entry.monthlySpend > 500) {
        const saving = Math.round(entry.monthlySpend * 0.3);
        projectedSpend = entry.monthlySpend - saving;
        alternativeName = "Credex discounted credits";
        recommendedAction = `API spend of $${entry.monthlySpend}/mo qualifies for Credex discounted credit pools. Enterprise reseller agreements can cut this by ~30%, saving ~$${saving}/mo with zero code changes.`;
        savingsReason = "Credex sources credits from companies that overforecast API usage.";
      } else {
        isOptimal = true;
        recommendedAction = `API spend of $${entry.monthlySpend}/mo is within normal range. Set budget alerts in the ${tool.name === "Anthropic API" ? "Anthropic" : "OpenAI"} console to avoid surprise bills.`;
        savingsReason = "Spend is within typical range.";
      }
    }

    // === GEMINI ===
    else if (tool.id === "gemini") {
      if (plan.name === "Ultra") {
        projectedSpend = 20;
        alternativeName = "Gemini Advanced";
        recommendedAction = "Downgrade from Ultra ($30/mo) to Advanced ($20/mo). Real-world benchmarks show minimal difference for writing, coding, and research tasks.";
        savingsReason = "Ultra offers marginal gains over Advanced for most use cases.";
      } else {
        isOptimal = true;
        recommendedAction = plan.name === "Advanced" ? "Gemini Advanced is competitive with Claude Pro and ChatGPT Plus." : "No changes recommended for your Gemini plan.";
        savingsReason = "Plan is appropriate.";
      }
    }

    // === WINDSURF ===
    else if (tool.id === "windsurf") {
      if (plan.name === "Teams" && useCase === "coding" && entry.seats >= 3) {
        const cursorAlt = 20 * entry.seats;
        if (cursorAlt < entry.monthlySpend) {
          projectedSpend = cursorAlt;
          alternativeName = "Cursor Pro";
          recommendedAction = `For a coding-first team of ${entry.seats}, Cursor Pro ($20/user/mo = $${cursorAlt}/mo) offers a stronger IDE integration and context window vs Windsurf Teams.`;
          savingsReason = "Cursor's codebase indexing is significantly stronger for larger repos.";
        } else {
          isOptimal = true;
          recommendedAction = "Windsurf Teams is competitively priced for your team size.";
          savingsReason = "No savings identified.";
        }
      } else {
        isOptimal = true;
        recommendedAction = plan.name === "Pro" ? "Windsurf Pro is good value for individual developers." : "Plan looks appropriate.";
        savingsReason = "No changes needed.";
      }
    }

    // === FALLBACK ===
    else {
      isOptimal = true;
      recommendedAction = "Plan looks appropriate. No immediate optimizations identified.";
      savingsReason = "No changes needed.";
    }

    const monthlySaving = Math.max(0, entry.monthlySpend - projectedSpend);

    return {
      toolId: tool.id,
      toolName: tool.name,
      icon: tool.icon,
      planName: entry.planName,
      seats: entry.seats,
      currentSpend: entry.monthlySpend,
      recommendedAction,
      alternativeName,
      projectedSpend: isOptimal ? entry.monthlySpend : projectedSpend,
      monthlySaving: isOptimal ? 0 : monthlySaving,
      isOptimal,
      savingsReason,
    };
  });

  const totalMonthlySaving = results.reduce((s, r) => s + r.monthlySaving, 0);
  const totalCurrentSpend = results.reduce((s, r) => s + r.currentSpend, 0);

  return {
    results,
    totalMonthlySaving,
    totalAnnualSaving: totalMonthlySaving * 12,
    totalCurrentSpend,
    teamSize,
    useCase,
  };
}
