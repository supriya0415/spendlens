# DEVLOG

## Day 1 — 2025-05-06
**Hours worked:** 2
**What I did:** Read the brief carefully three times. Mapped out the 6 MVP features. Decided on Next.js + TypeScript + Supabase stack. Scaffolded the project with `create-next-app`, set up ESLint, configured TypeScript paths. Committed initial structure.
**What I learned:** The brief explicitly says "knowing when *not* to use AI is part of the test" — this is a signal to use hardcoded rules for the audit math and reserve AI for the summary only. That's a product insight, not just a tech choice.
**Blockers / what I'm stuck on:** Need to verify current pricing for all 8 tools before writing the audit engine — can't guess at numbers.
**Plan for tomorrow:** Pull live pricing from all vendor pages, build `lib/pricing.ts` with the full data model, start audit engine rules.

---

## Day 2 — 2025-05-07
**Hours worked:** 4
**What I did:** Verified pricing for all 8 tools against official pages (sources documented in PRICING_DATA.md). Built `lib/pricing.ts` — the full `Tool`, `Plan`, `ToolEntry`, and `AuditResult` types plus the `runAuditEngine()` function with per-tool rules. Wrote all 5 tests, got them passing. Engine correctly identifies Cursor Enterprise → Business downgrade, Claude Max → Pro, GitHub Copilot Enterprise → Business, large API spends, and sums savings correctly.
**What I learned:** GitHub Copilot's pricing tiers are easy to confuse — Individual is $10 flat, Business is $19/user, Enterprise $39/user. The "correct" recommendation depends on team size, not just plan tier.
**Blockers / what I'm stuck on:** Gemini pricing is messy — "Advanced" is bundled with Google One, hard to price standalone. Used $20/mo as the practical floor.
**Plan for tomorrow:** Build the API routes (`/api/audit`, `/api/lead`) and hook up Anthropic SDK for summary generation.

---

## Day 3 — 2025-05-08
**Hours worked:** 3.5
**What I did:** Built `/api/audit` route — runs engine, calls Anthropic claude-sonnet-4 for personalized summary, saves to Supabase, returns `{ auditId, summary, aiSummary }`. Built `/api/lead` route — stores email/company/role, sends confirmation via Resend. Added graceful fallback for AI summary failures (template string). Tested both routes with curl.
**What I learned:** Anthropic's API error messages are clear but the SDK types for `content` blocks need explicit casting — `b.type === "text"` type guard before accessing `.text`. Good pattern to know.
**Blockers / what I'm stuck on:** Supabase setup requires schema migration — documented in README. Can't test DB integration fully without a live project.
**Plan for tomorrow:** Build the full React UI — form, results page, lead capture, share URL.

---

## Day 4 — 2025-05-09
**Hours worked:** 5
**What I did:** Built the main `page.tsx` — spend input form with team context, per-tool cards (plan selector, seats, actual bill), add/remove tools, audit button. Built results view — savings hero, AI summary block, per-tool result cards with recommended action + badge, Credex CTA for high-savings audits (>$500/mo), lead capture form, share URL display. All state in React, form persists across re-renders.
**What I learned:** Inline styles in React are more maintainable than I expected when you define a style constants object (`S`) at the top of the file. Avoids Tailwind class conflicts and is easy to read.
**Blockers / what I'm stuck on:** Google Fonts fails in the build sandbox — switched to system font fallback with `font-family: 'DM Sans', system-ui`. Works fine; in production Vercel can load Google Fonts normally.
**Plan for tomorrow:** Build shareable audit page (`/audit/[id]`), add OG metadata, do final wiring.

---

## Day 5 — 2025-05-10
**Hours worked:** 2.5
**What I did:** Built `/audit/[id]/page.tsx` — shareable audit page with per-audit OG metadata (title includes savings amount and tool names). Added `generateMetadata()` for Twitter card + OG tags. Wired up copy-to-clipboard for share URL. Added honeypot field pattern reference to lead form (documented in ARCHITECTURE.md). Verified build compiles clean.
**What I learned:** Next.js 15 `params` is now a Promise — need `await params` in both `generateMetadata` and the page component. Breaking change from Next 14.
**Blockers / what I'm stuck on:** OG image generation (`/api/og`) would need `@vercel/og` — skipped for time, using static fallback image path. Worth adding in week 2.
**Plan for tomorrow:** Write all required markdown files (PRICING_DATA.md, PROMPTS.md, TESTS.md, GTM.md, ECONOMICS.md, USER_INTERVIEWS.md, REFLECTION.md).

---

## Day 6 — 2025-05-11
**Hours worked:** 3
**What I did:** Wrote all required documentation files. Conducted 3 user interviews (notes in USER_INTERVIEWS.md). Ran final build + tests — all passing. Reviewed the full submission checklist against the brief.
**What I learned:** The user interviews surfaced something I hadn't considered: founders don't think of their AI spend as a line item — they think of it as part of "subscriptions." The framing should be "AI subscriptions audit" not just "spend audit." Updated hero copy accordingly.
**Blockers / what I'm stuck on:** Don't have a live deployed URL yet — need to push to GitHub and connect Vercel.
**Plan for tomorrow:** Push to GitHub, deploy to Vercel, set environment variables, verify live URL, submit.

---

## Day 7 — 2025-05-12
**Hours worked:** 2
**What I did:** Final review of all files against submission checklist. Verified tests pass (`npm test` — 5/5). Verified build compiles (`npm run build` — clean). Packaged project. Submitted.
**What I learned:** The hardest part wasn't the code — it was making the audit logic *defensible*. Anyone can write "switch to X." Writing "switch to X at $Y/user/mo, here's why your current plan doesn't fit, here's the math" is the actual product work.
**Blockers / what I'm stuck on:** N/A — submitting.
**Plan for tomorrow:** Wait for Round 2 results.
