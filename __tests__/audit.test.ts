import { runAuditEngine } from "../lib/pricing";

describe("Audit Engine", () => {

  test("1. Cursor Enterprise gets downgrade recommendation to Business", () => {
    const result = runAuditEngine(
      [{ toolId: "cursor", planName: "Enterprise", seats: 5, monthlySpend: 400 }],
      10, "coding"
    );
    const r = result.results[0];
    expect(r.monthlySaving).toBeGreaterThan(0);
    expect(r.isOptimal).toBe(false);
    expect(r.recommendedAction.toLowerCase()).toContain("business");
  });

  test("2. GitHub Copilot Business is marked optimal", () => {
    const result = runAuditEngine(
      [{ toolId: "github_copilot", planName: "Business", seats: 8, monthlySpend: 152 }],
      10, "coding"
    );
    const r = result.results[0];
    expect(r.isOptimal).toBe(true);
    expect(r.monthlySaving).toBe(0);
  });

  test("3. Claude Max gets downgrade recommendation to Pro", () => {
    const result = runAuditEngine(
      [{ toolId: "claude", planName: "Max", seats: 1, monthlySpend: 100 }],
      2, "writing"
    );
    const r = result.results[0];
    expect(r.monthlySaving).toBeGreaterThan(0);
    expect(r.projectedSpend).toBeLessThan(100);
    expect(r.recommendedAction.toLowerCase()).toContain("pro");
  });

  test("4. Large Anthropic API spend surfaces Credex credit opportunity", () => {
    const result = runAuditEngine(
      [{ toolId: "anthropic_api", planName: "Pay-as-you-go", seats: 1, monthlySpend: 2000 }],
      15, "coding"
    );
    const r = result.results[0];
    expect(r.monthlySaving).toBeGreaterThan(0);
    expect(r.recommendedAction.toLowerCase()).toContain("credex");
  });

  test("5. Total savings sums correctly across multiple tools", () => {
    const result = runAuditEngine(
      [
        { toolId: "cursor", planName: "Enterprise", seats: 5, monthlySpend: 400 },
        { toolId: "claude", planName: "Max", seats: 1, monthlySpend: 100 },
        { toolId: "github_copilot", planName: "Business", seats: 5, monthlySpend: 95 },
      ],
      10, "coding"
    );
    const expectedTotal = result.results.reduce((sum, r) => sum + r.monthlySaving, 0);
    expect(result.totalMonthlySaving).toBe(expectedTotal);
    expect(result.totalAnnualSaving).toBe(expectedTotal * 12);
    expect(result.totalMonthlySaving).toBeGreaterThan(0);
  });

});
