# SpendLens — AI Spend Audit for Startups

**SpendLens is a free web app that audits your startup's AI tool spending and tells you exactly where you're overspending, what to switch to, and your total monthly + annual savings.**

Built as a lead-generation tool for [Credex](https://credex.rocks), which sells discounted AI infrastructure credits.

## Screenshots

> Run locally and screenshot the audit form + results page, or record a 30-second Loom.

## Live URL

https://spendlens.credex.rocks

## Supported Tools

Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, Windsurf

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/spendlens
cd spendlens
npm install
cp .env.example .env.local
# Fill in your keys in .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npx vercel --prod
# Set environment variables in Vercel dashboard
```

## Run Tests

```bash
npm test
```

## Supabase Schema

Run this SQL in your Supabase project:

```sql
create table audits (
  id text primary key,
  team_size int,
  use_case text,
  total_monthly_spend numeric,
  total_monthly_saving numeric,
  results jsonb,
  ai_summary text,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  company text,
  role text,
  audit_id text references audits(id),
  monthly_saving numeric,
  created_at timestamptz default now()
);
```

## Decisions

1. **Next.js App Router over plain React** — Server components + API routes in one repo, easy Vercel deploy, built-in OG image support. Trade-off: more opinionated than Vite + Express, but deploy velocity wins.

2. **Hardcoded audit rules over AI for the math** — The assignment says "knowing when *not* to use AI is part of the test." Deterministic rules are auditable, fast, and don't cost API credits per audit. AI is used only for the personalized summary paragraph.

3. **Supabase over Firebase** — Postgres gives us proper relational queries if we ever want to analyze patterns across audits. Firebase is faster to set up but harder to query analytically.

4. **No auth** — Friction kills conversion. Email is captured *after* value is shown. This is the right product decision — fewer than 5% of users create accounts before seeing value on free tools.

5. **Resend over SendGrid/SES** — Resend has a clean API, generous free tier (3,000 emails/mo), and React Email support for future templating. SES is cheaper at scale but requires domain verification ceremony.
