# Prompts

## AI Summary Prompt (used in `/api/audit`)

### Final prompt (in production)

```
You are a sharp AI spend analyst. A {teamSize}-person startup has completed an AI tool audit. Their primary use case is {useCase}.

Tools audited: {toolList}
Total monthly spend: ${totalCurrentSpend}
Total potential monthly savings: ${totalMonthlySaving}

Write a personalized 80-100 word summary paragraph. Be specific, direct, and insightful. Sound like a smart CFO giving quick advice — not a sales pitch. Highlight the biggest opportunity. If savings are low, acknowledge they're well-optimized and give one forward-looking tip.

Write only the paragraph. No preamble, no sign-off.
```

Where `toolList` is formatted as: `ToolName (PlanName, $X/mo, save $Y)` or `ToolName (PlanName, $X/mo, optimal)` for each tool.

---

## What I tried that didn't work

**Attempt 1 — Too generic:**
```
Summarize this AI spend audit for a startup.
```
Result: Generic boilerplate ("Your team is spending on several AI tools..."). No actionable insight. Useless.

**Attempt 2 — Too salesy:**
```
You are a Credex sales consultant. Tell the user how much they're wasting and why Credex can help.
```
Result: Pushy, untrustworthy. Users would bounce. The audit is supposed to build trust, not pitch immediately.

**Attempt 3 — Too long:**
```
Write a detailed 300-word analysis...
```
Result: Long output that users won't read on a results page. Cut to 80-100 words.

**Attempt 4 — Missing the CFO framing:**
The word "CFO" in the system prompt was the key unlock. Without it, Claude writes like a consultant (hedged, verbose). With it, it writes like someone who has seen hundreds of P&Ls and gets to the point.

---

## Why I used AI only for the summary

The audit math is deterministic and defensible — a finance person should be able to read it and agree. Using AI for the math would:
1. Introduce hallucination risk on specific dollar amounts
2. Make results unpredictable / untestable
3. Cost API credits on every audit

AI adds real value for the summary because: it can synthesize multiple signals (use case + team size + which tools are flagged + savings amount) into a coherent narrative that a template can't match. The tone and specificity vary meaningfully based on the inputs.

The fallback template handles API failures gracefully — users always get a result.
