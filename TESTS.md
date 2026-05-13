# Tests

## How to Run

```bash
npm test
```

All tests are in `__tests__/audit.test.ts` and use Jest + ts-jest.

---

## Test Suite: Audit Engine (`__tests__/audit.test.ts`)

5 tests covering the core audit logic. All pass.

| # | Test | File | What it covers |
|---|------|------|----------------|
| 1 | Cursor Enterprise gets downgrade recommendation | `audit.test.ts` | Verifies that a user on Cursor Enterprise gets a non-zero saving and a recommendation mentioning "business" |
| 2 | GitHub Copilot Business is marked optimal | `audit.test.ts` | Verifies well-priced plans return `isOptimal: true` and `monthlySaving: 0` |
| 3 | Claude Max gets downgrade recommendation to Pro | `audit.test.ts` | Verifies Max ($100) returns a projected spend less than $100 and mentions "pro" |
| 4 | Large Anthropic API spend surfaces Credex credit opportunity | `audit.test.ts` | Verifies API spend >$500/mo triggers Credex recommendation and positive saving |
| 5 | Total savings sums correctly across multiple tools | `audit.test.ts` | Verifies `totalMonthlySaving` = sum of individual `monthlySaving` values, and `totalAnnualSaving` = monthly × 12 |

---

## Test Output

```
PASS __tests__/audit.test.ts
  Audit Engine
    ✓ 1. Cursor Enterprise gets downgrade recommendation to Business (3 ms)
    ✓ 2. GitHub Copilot Business is marked optimal (1 ms)
    ✓ 3. Claude Max gets downgrade recommendation to Pro (1 ms)
    ✓ 4. Large Anthropic API spend surfaces Credex credit opportunity (1 ms)
    ✓ 5. Total savings sums correctly across multiple tools

Tests: 5 passed, 5 total
Time: 0.687s
```

---

## What's Not Tested (and why)

- **API routes** — Would require mocking Supabase and Anthropic clients. Worth adding in week 2 with `msw` for HTTP mocking.
- **React components** — UI logic is thin (display only); the business logic lives in `lib/pricing.ts` which is fully tested.
- **Lead capture** — Depends on external services (Supabase, Resend); integration tests need a test environment.
