# Reflection

## 1. The Hardest Bug I Hit This Week

**The Next.js 15 `params` Promise breaking change.**

In Next.js 15, dynamic route params (`params`) became a Promise — you have to `await params` before accessing `params.id`. In Next.js 14, it was synchronous. My `/audit/[id]/page.tsx` was failing with a cryptic TypeScript error: "Property 'id' does not exist on type 'Promise<{id: string}>'."

**My hypotheses:**
1. I'd typed the Props interface wrong
2. There was a version mismatch between the types and the runtime
3. Next.js had changed something in the App Router

**What I tried:**
- Checked the Props type definition — looked correct at first glance
- Looked at the Next.js docs for dynamic routes — the docs I found were for Next 14
- Searched for the error message — found a Next.js 15 migration guide note buried in a GitHub discussion

**What worked:** Reading the Next.js 15 changelog properly. The fix was `const { id } = await params` instead of `const { id } = params`. Two characters of difference, 45 minutes of confusion. The TypeScript error message was accurate but opaque without context.

**What I learned:** When framework types give you an error that seems wrong, check if the framework version changed the API. Don't assume your mental model of the API is current.

---

## 2. A Decision I Reversed Mid-Week

**Started with Tailwind classes everywhere. Switched to inline style constants.**

I started writing the UI with Tailwind utility classes — it's my default. But the dark theme required a lot of custom color values (`bg-[#0a0a0f]`, `border-[#2e2e45]`) that made the class strings long and hard to read.

I switched to a style constants object at the top of `page.tsx`:
```ts
const S = {
  bg: "#0a0a0f", surface: "#13131a", border: "#2e2e45", ...
};
```

This made the component much easier to read and the theme consistent throughout. Trade-off: slightly more verbose than Tailwind shorthand for simple things like padding. Worth it for this specific project because the dark custom palette was central to the design.

I kept Tailwind for the `globals.css` utility classes like `fade-in` and `animate-pulse-dot`.

---

## 3. What I Would Build in Week 2

**Dynamic OG image generation** — Right now the shareable URL uses a static fallback image. With `@vercel/og`, I could generate a custom OG image per audit showing the savings amount in big text (e.g. "I found $340/mo in AI savings"). This is the thing that would actually drive Twitter/X clicks and make the viral loop work. It's a 3-hour build.

**Rate limiting on the audit API** — Currently anyone can hammer `/api/audit`. I'd add Upstash Redis-based rate limiting (10 audits/IP/hour) and a honeypot field on the form. Takes 1 hour.

**Benchmark mode** — "Your team spends $X per developer on AI tools. Companies your size average $Y." This requires storing aggregate anonymized data from audits, which is now possible since audits go to Supabase. Would be a strong retention hook.

---

## 4. How I Used AI Tools

**Tools used:** Claude (claude.ai), ChatGPT

**For what:**
- Claude for writing and refining the audit rule logic — I described the decision tree in prose and asked it to help me structure the TypeScript types cleanly
- Claude for the ARCHITECTURE.md Mermaid diagram — described the data flow, asked for a diagram
- ChatGPT for quickly looking up current pricing pages — "what's the current URL for GitHub Copilot pricing"
- Claude for drafting sections of the markdown docs (GTM, ECONOMICS) — gave it the bullet points, it wrote prose, I edited heavily

**What I didn't trust AI with:**
- The actual pricing numbers — verified every price myself on the official page. LLMs hallucinate pricing data confidently.
- The test assertions — wrote those myself. AI-written tests tend to test the implementation, not the behavior.
- The user interview notes — had real conversations, not fabricated.

**One specific time the AI was wrong:**
Asked Claude to give me the current pricing for Windsurf Teams. It said $25/user/mo. The actual price is $35/user/mo. I caught it because I always verify pricing independently. This is exactly the kind of error that would make the audit untrustworthy if I hadn't checked.

---

## 5. Self-Rating

| Dimension | Rating (1–10) | Reason |
|-----------|---------------|--------|
| Discipline | 7 | Spread work across multiple days, but day 4 was a longer session than ideal. Consistent overall. |
| Code quality | 7 | TypeScript throughout, clean separation of concerns (pricing logic in lib/, API in app/api/). Could improve with more test coverage on API routes. |
| Design sense | 8 | Dark theme is intentional and polished. Results page is visually clear. Mobile-responsive. Hero copy is strong. |
| Problem-solving | 8 | Caught the Next.js 15 breaking change, debugged pricing data errors, reversed the Tailwind decision quickly. |
| Entrepreneurial thinking | 8 | User interviews changed real design decisions. GTM plan is specific and non-generic. Economics model shows real math. Understood the Credex business model and designed the CTA accordingly. |
