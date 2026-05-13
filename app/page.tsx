"use client";

import { useState, useCallback } from "react";
import { TOOLS, AuditSummary } from "@/lib/pricing";

interface ToolEntry {
  uid: string;
  toolId: string;
  planName: string;
  seats: number;
  monthlySpend: number;
}

let uidCounter = 0;
function makeUid() { return `t${++uidCounter}`; }

const USE_CASES = [
  { value: "coding", label: "Coding / Engineering" },
  { value: "writing", label: "Writing / Content" },
  { value: "data", label: "Data / Analysis" },
  { value: "research", label: "Research" },
  { value: "mixed", label: "Mixed" },
];

const S = {
  bg: "#0a0a0f", surface: "#13131a", surface2: "#1c1c26",
  border: "#2e2e45", border2: "#3d3d5c",
  text: "#f0f0f5", text2: "#a0a0b8", text3: "#6060a0",
  green: "#00d4a0", greenDim: "#003d30", greenBg: "#001a14",
  accent: "#7c6af5", accent2: "#5c4ed4",
  blue: "#4d9fff", blueDim: "#0a2a4a",
  mono: "var(--font-dm-mono)",
};

export default function Home() {
  const [entries, setEntries] = useState<ToolEntry[]>([
    { uid: makeUid(), toolId: "cursor", planName: "Pro", seats: 3, monthlySpend: 60 },
    { uid: makeUid(), toolId: "claude", planName: "Team", seats: 3, monthlySpend: 90 },
    { uid: makeUid(), toolId: "chatgpt", planName: "Plus", seats: 1, monthlySpend: 20 },
  ]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState("coding");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ auditId: string; summary: AuditSummary; aiSummary: string } | null>(null);
  const [email, setEmail] = useState(""); const [company, setCompany] = useState(""); const [role, setRole] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addingTool, setAddingTool] = useState(false);

  const existingTools = new Set(entries.map((e) => e.toolId));
  const availableTools = TOOLS.filter((t) => !existingTools.has(t.id));

  const addTool = useCallback((toolId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId)!;
    const plan = tool.plans[1] ?? tool.plans[0];
    setEntries((prev) => [...prev, { uid: makeUid(), toolId, planName: plan.name, seats: 1, monthlySpend: plan.pricePerUser }]);
    setAddingTool(false);
  }, []);

  const removeTool = (u: string) => setEntries((prev) => prev.filter((e) => e.uid !== u));

  const updateEntry = (u: string, key: keyof ToolEntry, val: string | number) => {
    setEntries((prev) => prev.map((e) => {
      if (e.uid !== u) return e;
      const updated = { ...e, [key]: val };
      if (key === "planName") {
        const tool = TOOLS.find((t) => t.id === e.toolId)!;
        const plan = tool.plans.find((p) => p.name === val)!;
        updated.monthlySpend = (plan.pricePerUser || 0) * updated.seats;
      }
      return updated;
    }));
  };

  const runAudit = async () => {
    if (!entries.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/audit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries: entries.map((e) => { const { uid, ...rest } = e; void uid; return rest; }), teamSize, useCase }),
      });
      const data = await res.json();
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch { alert("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const submitLead = async () => {
    if (!email || !email.includes("@")) return;
    await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, company, role, auditId: result?.auditId, monthlySaving: result?.summary.totalMonthlySaving ?? 0 }) });
    setLeadSent(true);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`https://spendlens.credex.rocks/audit/${result?.auditId}`).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const nav = (
    <nav style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"1rem 2rem",borderBottom:`1px solid ${S.border}`,background:S.surface }}>
      <div style={{ fontWeight:600,fontSize:"1.1rem",display:"flex",alignItems:"center",gap:8 }}>
        <span style={{ width:8,height:8,borderRadius:"50%",background:S.green,display:"inline-block",boxShadow:`0 0 8px ${S.green}` }} />
        SpendLens
      </div>
      {result
        ? <button onClick={()=>setResult(null)} style={{ background:"transparent",border:`1px solid ${S.border}`,color:S.text2,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13 }}>← New audit</button>
        : <div style={{ fontSize:11,background:S.greenDim,color:S.green,padding:"3px 10px",borderRadius:20,border:`1px solid ${S.greenDim}`,fontFamily:S.mono }}>Free Tool by Credex</div>
      }
    </nav>
  );

  // RESULTS VIEW
  if (result) {
    const { summary, aiSummary, auditId } = result;
    return (
      <div style={{ background:S.bg,color:S.text,minHeight:"100vh" }}>
        {nav}
        <div style={{ maxWidth:860,margin:"0 auto",padding:"2rem 1.5rem 4rem" }}>

          <div style={{ background:S.greenBg,border:`1px solid ${S.greenDim}`,borderRadius:16,padding:"2.5rem",textAlign:"center",marginBottom:"1.5rem" }}>
            <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:2,color:S.green,marginBottom:8,fontFamily:S.mono }}>Monthly savings identified</div>
            <div style={{ fontSize:"clamp(3rem,8vw,5rem)",fontWeight:300,color:S.green,letterSpacing:-2,lineHeight:1 }}>${summary.totalMonthlySaving.toLocaleString()}</div>
            <div style={{ color:S.text2,marginTop:8,fontSize:"0.95rem" }}>per month</div>
            <div style={{ color:S.green,fontWeight:500,fontSize:"1.2rem",marginTop:10 }}>${summary.totalAnnualSaving.toLocaleString()} per year</div>
          </div>

          <div style={{ background:S.surface2,border:`1px solid ${S.accent}`,borderRadius:14,padding:"1.5rem",marginBottom:"1.5rem" }}>
            <div style={{ fontSize:11,fontFamily:S.mono,color:S.accent,textTransform:"uppercase",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",gap:6 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:S.accent,display:"inline-block" }} className="animate-pulse-dot" />
              AI-generated summary
            </div>
            <p style={{ fontSize:14,lineHeight:1.8,color:S.text }}>{aiSummary}</p>
          </div>

          {summary.totalMonthlySaving > 500 && (
            <div style={{ background:"linear-gradient(135deg,#1a1a2e,#16213e)",border:`1px solid ${S.accent}`,borderRadius:16,padding:"2rem",textAlign:"center",marginBottom:"1.5rem" }}>
              <h3 style={{ color:S.accent,fontWeight:500,marginBottom:8 }}>Credex can lock in these savings</h3>
              <p style={{ fontSize:13,color:S.text2,lineHeight:1.7,marginBottom:16,maxWidth:400,marginLeft:"auto",marginRight:"auto" }}>
                We source discounted AI credits from companies that overforecast. Same tools, up to 40% less. For teams saving ${summary.totalMonthlySaving}+/mo, we&apos;ll personally walk you through the switch.
              </p>
              <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" style={{ background:S.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 24px",fontSize:14,fontWeight:500,textDecoration:"none",display:"inline-block" }}>
                Book a free consultation →
              </a>
            </div>
          )}

          <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:"1.5rem" }}>
            {summary.results.map((r, i) => (
              <div key={i} className="fade-in" style={{ background:r.monthlySaving>0?S.greenBg:S.surface,border:`1px solid ${r.monthlySaving>0?S.greenDim:S.border}`,borderRadius:14,padding:"1.25rem 1.5rem",animationDelay:`${i*0.08}s` }}>
                <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12,gap:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                    <span style={{ fontSize:22 }}>{r.icon}</span>
                    <div>
                      <div style={{ fontWeight:500 }}>{r.toolName}</div>
                      <div style={{ fontSize:12,color:S.text3,fontFamily:S.mono,marginTop:2 }}>{r.planName} · ${r.currentSpend}/mo · {r.seats} seat{r.seats!==1?"s":""}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right",flexShrink:0 }}>
                    {r.monthlySaving>0 ? (
                      <><div style={{ fontSize:"1.3rem",fontWeight:500,color:S.green,fontFamily:S.mono }}>−${r.monthlySaving}/mo</div><span style={{ fontSize:11,background:S.greenDim,color:S.green,borderRadius:20,padding:"2px 10px",fontFamily:S.mono }}>SAVE</span></>
                    ) : (
                      <><div style={{ fontSize:"0.95rem",color:S.text3 }}>✓ Optimal</div><span style={{ fontSize:11,background:S.blueDim,color:S.blue,borderRadius:20,padding:"2px 10px",fontFamily:S.mono }}>GOOD</span></>
                    )}
                  </div>
                </div>
                <div style={{ padding:"10px 14px",background:S.surface,borderRadius:8,borderLeft:`3px solid ${r.monthlySaving>0?S.green:S.blue}`,fontSize:13,color:S.text2,lineHeight:1.7 }}>
                  {r.recommendedAction}
                  {r.alternativeName && <span style={{ marginLeft:6,background:S.surface2,color:S.accent,fontSize:11,padding:"2px 8px",borderRadius:6,fontFamily:S.mono }}>→ {r.alternativeName}</span>}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:S.surface,border:`1px solid ${S.border}`,borderRadius:16,padding:"2rem",textAlign:"center",marginBottom:"1.5rem" }}>
            {leadSent ? (
              <div style={{ padding:"1rem",background:S.greenBg,borderRadius:10,color:S.green,fontSize:14 }}>
                ✓ Report sent! Check your inbox.
              </div>
            ) : (
              <>
                <h3 style={{ fontWeight:500,marginBottom:8 }}>Get this report by email</h3>
                <p style={{ fontSize:13,color:S.text2,marginBottom:20,lineHeight:1.7 }}>We&apos;ll send the full breakdown and alert you when new savings apply to your stack.</p>
                <div style={{ display:"grid",gap:10,maxWidth:400,margin:"0 auto 14px" }}>
                  <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} />
                  <input type="text" placeholder="Company name (optional)" value={company} onChange={e=>setCompany(e.target.value)} />
                  <input type="text" placeholder="Your role (optional)" value={role} onChange={e=>setRole(e.target.value)} />
                </div>
                <button onClick={submitLead} disabled={!email.includes("@")} style={{ background:S.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 0",fontSize:14,fontWeight:500,cursor:"pointer",width:"100%",maxWidth:400,opacity:email.includes("@")?1:0.5 }}>Send me the report</button>
                <div style={{ fontSize:12,color:S.text3,marginTop:10,cursor:"pointer",textDecoration:"underline" }} onClick={()=>setLeadSent(true)}>Skip for now</div>
              </>
            )}
          </div>

          <div style={{ background:S.surface2,borderRadius:12,padding:"1.25rem",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:"1.5rem" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13,fontWeight:500,marginBottom:4 }}>Share this audit</div>
              <div style={{ fontSize:12,color:S.text2 }}>Public link — PII stripped</div>
            </div>
            <div style={{ fontFamily:S.mono,fontSize:12,color:S.text2,background:S.surface,padding:"8px 12px",borderRadius:8,border:`1px solid ${S.border}`,flex:2,wordBreak:"break-all" }}>
              https://spendlens.credex.rocks/audit/{auditId}
            </div>
            <button onClick={copyUrl} style={{ background:S.surface2,border:`1px solid ${S.border2}`,color:S.text,borderRadius:8,padding:"8px 16px",fontSize:13,cursor:"pointer" }}>
              {copied?"Copied!":"Copy link"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div style={{ background:S.bg,color:S.text,minHeight:"100vh" }}>
      {nav}
      <div style={{ textAlign:"center",padding:"4rem 1.5rem 2.5rem",maxWidth:680,margin:"0 auto" }}>
        <div style={{ fontSize:11,textTransform:"uppercase",letterSpacing:2,color:S.accent,marginBottom:12,fontFamily:S.mono }}>AI Spend Audit</div>
        <h1 style={{ fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:300,lineHeight:1.15,marginBottom:16,letterSpacing:-1 }}>
          Stop guessing.<br /><strong style={{ fontWeight:600,color:S.green }}>Know what you&apos;re wasting</strong> on AI.
        </h1>
        <p style={{ fontSize:"1.05rem",color:S.text2,lineHeight:1.7,maxWidth:500,margin:"0 auto" }}>
          Enter your AI tool stack. Get an instant audit — where you&apos;re overspending, what to switch to, and your total savings.
        </p>
      </div>

      <div style={{ maxWidth:860,margin:"0 auto",padding:"0 1.5rem 4rem" }}>
        <div style={{ background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:"1.5rem",marginBottom:"1.25rem" }}>
          <div style={{ fontSize:11,fontFamily:S.mono,color:S.text2,textTransform:"uppercase",letterSpacing:1,marginBottom:14 }}>Team context</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              <label style={{ fontSize:11,color:S.text2,fontFamily:S.mono,textTransform:"uppercase",letterSpacing:0.5 }}>Team size</label>
              <input type="number" min={1} value={teamSize} onChange={e=>setTeamSize(+e.target.value)} />
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              <label style={{ fontSize:11,color:S.text2,fontFamily:S.mono,textTransform:"uppercase",letterSpacing:0.5 }}>Primary use case</label>
              <select value={useCase} onChange={e=>setUseCase(e.target.value)}>
                {USE_CASES.map(u=><option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:12 }}>
          {entries.map(entry => {
            const tool = TOOLS.find(t=>t.id===entry.toolId)!;
            return (
              <div key={entry.uid} style={{ background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:"1.25rem 1.5rem" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <span style={{ fontSize:20 }}>{tool.icon}</span>
                    <span style={{ fontWeight:500 }}>{tool.name}</span>
                  </div>
                  <button onClick={()=>removeTool(entry.uid)} style={{ background:"transparent",border:`1px solid ${S.border}`,color:S.text2,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:16 }}>×</button>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    <label style={{ fontSize:11,color:S.text2,fontFamily:S.mono,textTransform:"uppercase",letterSpacing:0.5 }}>Plan</label>
                    <select value={entry.planName} onChange={e=>updateEntry(entry.uid,"planName",e.target.value)}>
                      {tool.plans.map(p=><option key={p.name} value={p.name}>{p.name} (${p.pricePerUser}/user/mo)</option>)}
                    </select>
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                    <label style={{ fontSize:11,color:S.text2,fontFamily:S.mono,textTransform:"uppercase",letterSpacing:0.5 }}>Seats</label>
                    <input type="number" min={1} value={entry.seats} onChange={e=>updateEntry(entry.uid,"seats",+e.target.value)} />
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:6,gridColumn:"1/-1" }}>
                    <label style={{ fontSize:11,color:S.text2,fontFamily:S.mono,textTransform:"uppercase",letterSpacing:0.5 }}>Actual monthly bill ($)</label>
                    <input type="number" min={0} value={entry.monthlySpend} onChange={e=>updateEntry(entry.uid,"monthlySpend",+e.target.value)} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {addingTool ? (
          <div style={{ background:S.surface,border:`1px solid ${S.border2}`,borderRadius:14,padding:"1.25rem",marginBottom:12 }}>
            <div style={{ fontSize:13,color:S.text2,marginBottom:12 }}>Select a tool to add:</div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:8 }}>
              {availableTools.map(t=>(
                <button key={t.id} onClick={()=>addTool(t.id)} style={{ background:S.surface2,border:`1px solid ${S.border}`,color:S.text,borderRadius:10,padding:"10px 14px",cursor:"pointer",fontSize:13,textAlign:"left",display:"flex",alignItems:"center",gap:8 }}>
                  <span>{t.icon}</span>{t.name}
                </button>
              ))}
            </div>
            <button onClick={()=>setAddingTool(false)} style={{ marginTop:10,background:"transparent",border:"none",color:S.text3,fontSize:13,cursor:"pointer",textDecoration:"underline" }}>Cancel</button>
          </div>
        ) : (
          <button onClick={()=>setAddingTool(true)} disabled={availableTools.length===0} style={{ background:S.surface,border:`1px dashed ${S.border2}`,borderRadius:14,padding:"1rem",color:S.text3,cursor:"pointer",fontSize:14,fontFamily:"var(--font-dm-sans)",width:"100%",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
            + Add another tool
          </button>
        )}

        <hr style={{ border:"none",borderTop:`1px solid ${S.border}`,margin:"1.5rem 0" }} />

        <button onClick={runAudit} disabled={loading||!entries.length} style={{ width:"100%",padding:"1rem",borderRadius:12,border:"none",background:loading?"#3d3d5c":`linear-gradient(135deg,${S.accent},${S.accent2})`,color:"#fff",fontSize:"1rem",fontWeight:600,fontFamily:"var(--font-dm-sans)",cursor:loading?"not-allowed":"pointer" }}>
          {loading?"Analyzing your stack...":"Run my AI spend audit →"}
        </button>
        <p style={{ textAlign:"center",fontSize:12,color:S.text3,marginTop:14 }}>No login required · Results in under 10 seconds · Free forever</p>
      </div>
    </div>
  );
}
