# Unit Economics

## What a Converted Lead Is Worth to Credex

Credex sells discounted AI credits. Assumptions:
- Average deal: $500/mo in credits at ~15% margin = **$75/mo gross profit per customer**
- Average contract length: 12 months
- **LTV per customer: ~$900**

These are conservative estimates. Larger customers ($2,000+/mo API spend) are worth $2,700+ LTV.

---

## CAC at Each Channel (from GTM Plan)

| Channel | Cost | Leads | Conversions | CAC |
|---------|------|-------|-------------|-----|
| Hacker News Show HN | $0 (time: 2hr) | 50 | 2 | ~$0 + time |
| LinkedIn DMs (20 personalized) | $0 (time: 3hr) | 10 | 0.5 | ~$0 + time |
| Slack community posts | $0 (time: 1hr) | 20 | 1 | ~$0 + time |
| Twitter | $0 (time: 1hr) | 20 | 0.5 | ~$0 + time |
| **Week 1 total** | **$0** | **100** | **~4** | **$0 cash** |

At scale with paid distribution (LinkedIn Ads targeting Engineering Managers):
- CPC: ~$8
- Conversion to audit: 15% (landing page → audit completion)
- Email capture: 20% of audits
- Consult booking: 12% of email captures
- Deal close: 50% of consult bookings
- **CAC via paid: ~$8 / (0.15 × 0.20 × 0.12 × 0.50) = ~$2,222**

At $900 LTV, paid CAC is not profitable. Paid is for brand, not acquisition. Organic + product virality (share URL) is the real channel.

---

## Conversion Funnel

```
Lands on SpendLens          100%
Completes audit form         60%   (high intent — they came for this)
Views results page           58%   (2% bounce on loading)
Submits email                12%   (email shown after value delivered)
Opens confirmation email     35%   (transactional email open rate)
Books Credex consultation     8%   (of email submitters, for >$500/mo savings)
Closes Credex deal           50%   (warm lead, already saw the savings math)
```

For 1,000 audits: ~7 Credex deals → ~$6,300 gross profit in month 1.

---

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR = $83,333/mo gross profit = ~1,111 paying Credex customers at $75/mo gross.

To get 1,111 customers from SpendLens:
- Need ~14,000 email captures (8% → Credex customer)
- Need ~116,000 audits completed (12% email capture)
- At 200 audits/day (achievable with 1 viral HN post/month + SEO) → 116,000 audits = ~18 months ✓

The math works if:
1. SpendLens gets consistent organic traffic (HN, SEO, tool comparison sites)
2. The share URL creates viral loops (each audit shared → 1.3 new audits avg)
3. Credex closes deals at 50%+ (reasonable for warm, pre-qualified leads who saw their own savings)

This is plausible but requires Credex to treat SpendLens as a real product with ongoing distribution effort — not a one-time launch.

---

## Risks

- **Pricing data goes stale** — Tools reprice quarterly. Needs a human audit or automated price monitoring to stay credible.
- **Low-savings audits hurt trust** — If someone's already optimal and we show "$0 savings," they need to feel good about that, not misled. Current copy handles this ("You're spending well").
- **Credex consultation booking rate could be lower** — Even 3% instead of 8% still makes the math work at volume; it just takes longer.
