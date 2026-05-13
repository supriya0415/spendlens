# Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Next.js App (React, TypeScript)                      │  │
│  │  ┌──────────────┐   ┌──────────────────────────────┐  │  │
│  │  │  Spend Form  │──▶│  Results Page + Lead Capture │  │  │
│  │  └──────┬───────┘   └──────────────────────────────┘  │  │
│  └─────────┼─────────────────────────────────────────────┘  │
└────────────┼────────────────────────────────────────────────┘
             │ POST /api/audit
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js API Routes                        │
│                                                             │
│  /api/audit                    /api/lead                    │
│  ┌─────────────────────┐      ┌──────────────────────────┐  │
│  │ 1. runAuditEngine() │      │ 1. Store lead (Supabase) │  │
│  │    (lib/pricing.ts) │      │ 2. Send email (Resend)   │  │
│  │ 2. Anthropic API    │      └──────────────────────────┘  │
│  │    (AI summary)     │                                    │
│  │ 3. Save to Supabase │                                    │
│  │ 4. Return results   │                                    │
│  └─────────────────────┘                                    │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ▼                            ▼
┌────────────────────┐        ┌───────────────────────┐
│  Anthropic API     │        │  Supabase (Postgres)   │
│  claude-sonnet-4   │        │  - audits table        │
│  AI summary only   │        │  - leads table         │
└────────────────────┘        └───────────────────────┘
```

## Data Flow: Input → Audit Result

```
User fills form
      │
      ▼
{ toolId, planName, seats, monthlySpend } × N tools
+ teamSize, useCase
      │
      ▼ POST /api/audit
      │
      ├──▶ runAuditEngine() [lib/pricing.ts]
      │         │
      │         ├── For each tool: apply deterministic rules
      │         │   (plan fit check, cheaper alternative calc,
      │         │    seat reduction, API spend threshold)
      │         │
      │         └── Return: savings per tool, total savings, recommendations
      │
      ├──▶ Anthropic API (claude-sonnet-4)
      │         └── ~100-word personalized summary paragraph
      │             Fallback: template string if API fails
      │
      ├──▶ Supabase INSERT audit row (id, results JSON, savings, summary)
      │
      └──▶ Response: { auditId, summary, aiSummary }
                │
                ▼
          Results page renders
          Lead capture shown
          Unique share URL generated: /audit/{auditId}
```

## Stack Choice

**Next.js 15 + TypeScript** — App Router gives us collocated API routes, server components for the shareable audit page (OG metadata), and Vercel deploys in one push. TypeScript catches pricing logic errors at compile time, which matters when the numbers need to be defensible.

**Supabase** — Postgres gives proper relational queries for future analytics (e.g. "which tools do high-savings audits have in common"). Firebase is faster to set up but harder to analyze. Supabase's free tier handles our expected volume.

**Resend** — Clean REST API, 3,000 emails/mo free, React Email support for future templating. SES is cheaper at scale but requires domain ceremony. Resend is right for launch.

**Hardcoded audit rules, not AI for the math** — Deterministic logic is auditable, fast, zero API cost per audit, and testable. A finance person can read `lib/pricing.ts` and verify every recommendation. AI is used only for the prose summary where nuance genuinely helps.

## Scaling to 10k Audits/Day

Current architecture is stateless at the compute layer — Next.js API routes are serverless functions. The bottlenecks at scale would be:

1. **Supabase write throughput** → move to connection pooling (PgBouncer, already built into Supabase)
2. **Anthropic API rate limits** → queue AI summary generation (BullMQ + Redis), serve template immediately and update when AI summary arrives
3. **Cold starts** → Edge Runtime for the audit route (pure JS computation, no Node-only deps needed)
4. **Read load on shareable pages** → ISR (Incremental Static Regeneration) for `/audit/[id]` — cache the HTML at the CDN edge after first render
