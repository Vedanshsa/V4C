import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type ComplianceStatus } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, ShieldCheck, X, Upload, FileText, ServerCrash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { analyzeDocument } from "@/lib/api";
import { saveDocumentScan, getCurrentUser } from "@/lib/authService";

import type { LucideIcon } from "lucide-react";

const statusConfig: Record<ComplianceStatus, { label: string; icon: LucideIcon; cls: string; dot: string }> = {
  completed: { label: "Done", icon: CheckCircle2, cls: "bg-success/10 text-success border-success/30", dot: "bg-success" },
  pending: { label: "Pending", icon: Clock, cls: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  risk: { label: "At risk", icon: AlertTriangle, cls: "bg-warning/10 text-warning border-warning/30", dot: "bg-warning" },
  missing: { label: "Missing", icon: AlertCircle, cls: "bg-destructive/10 text-destructive border-destructive/30", dot: "bg-destructive" },
};


export function CompliancePanel() {
  const items = useAppStore((s) => s.items);
  const alerts = useAppStore((s) => s.alerts);
  const dismissAlert = useAppStore((s) => s.dismissAlert);



  return (
    <aside className="flex h-full flex-col border-l border-border/60 bg-secondary/30">
      <div className="border-b border-border/60 bg-background/40 px-6 py-4 backdrop-blur">
        <h3 className="text-sm font-semibold">Live compliance</h3>
        <p className="text-xs text-muted-foreground">Updates as you talk</p>
      </div>

      <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto p-4">
        {/* Score card removed */}

        {/* Alerts */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live alerts</h4>
            {alerts.length > 0 && (
              <span className="text-xs text-muted-foreground">{alerts.length}</span>
            )}
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {alerts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-dashed border-border bg-card/40 px-4 py-6 text-center text-xs text-muted-foreground"
                >
                  No alerts yet — start chatting to see live updates.
                </motion.div>
              )}
              {alerts.map((a) => (
                <motion.div
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <AlertCard alert={a} onDismiss={() => dismissAlert(a.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* Checklist */}
        <section>
          <h4 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Smart checklist</h4>
          <Card className="overflow-hidden border-border/60">
            <ul className="divide-y divide-border/60">
              {items.map((it) => {
                const c = statusConfig[it.status];
                const Icon = c.icon;
                return (
                  <motion.li
                    key={it.id}
                    layout
                    className="flex items-start gap-3 p-3"
                  >
                    <span className={cn("mt-1 flex h-2 w-2 shrink-0 rounded-full", c.dot)} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{it.description}</p>
                    </div>
                    <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium", c.cls)}>
                      {(() => { const Icon = c.icon; return <Icon className="h-3 w-3" />; })()}
                      {c.label}
                    </span>
                  </motion.li>
                );
              })}
            </ul>
          </Card>
        </section>

        {/* Document upload */}
        <DocumentDrop />
      </div>
    </aside>
  );
}





function AlertCard({ alert, onDismiss }: { alert: ReturnType<typeof useAppStore.getState>["alerts"][number]; onDismiss: () => void }) {
  const tone =
    alert.severity === "critical" ? "border-destructive/40 bg-destructive/5" :
    alert.severity === "warning" ? "border-warning/40 bg-warning/5" :
    "border-success/40 bg-success/5";
  const Icon = alert.severity === "safe" ? CheckCircle2 : alert.severity === "warning" ? AlertTriangle : AlertCircle;
  const iconTone =
    alert.severity === "critical" ? "text-destructive" :
    alert.severity === "warning" ? "text-warning" :
    "text-success";

  return (
    <div className={cn("relative rounded-2xl border p-3 pr-8", tone)}>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label="Dismiss alert"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconTone)} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{alert.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{alert.impact}</p>
          <button className={cn("mt-2 text-xs font-semibold underline-offset-2 hover:underline", iconTone)}>
            {alert.action} →
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentDrop() {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ isLegal: boolean; message: string; details?: string[]; riskLevel?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };
  
  const handleFile = async (f: File) => {
    setFile({ name: f.name, size: f.size });
    setAnalyzing(true);
    setResult(null);
    setError(null);

    // Pull jurisdiction + document types from the user's onboarding profile
    const store = useAppStore.getState();
    const jurisdiction = store.profile.businessType || "in";
    const documentTypes = store.profile.dataUsage || [];

    try {
      const data = await analyzeDocument(f, jurisdiction, documentTypes);
      setResult({
        isLegal: data.is_legal,
        message: data.message || (data.is_legal ? "Document is legally sound." : "Legal issues detected."),
        details: data.details,
        riskLevel: data.risk_level,
      });

      // Async save to Supabase history
      getCurrentUser().then(user => {
        if (user) {
          saveDocumentScan(
            user.id,
            f.name,
            data.is_legal,
            data.message || (data.is_legal ? "Document is legally sound." : "Legal issues detected."),
            data.risk_level,
            data.details,
            jurisdiction
          ).catch(console.error);
        }
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Cannot reach backend. Make sure the FastAPI server is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <section>
      <h4 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Document intelligence</h4>
      <Card className="border-border/60 p-3">
        {!file ? (
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-background/40 px-4 py-6 text-center transition-colors hover:border-brand-purple/60 hover:bg-brand-purple/5"
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Verify legal terms</p>
              <p className="text-xs text-muted-foreground">Drop a document to check its legal validity</p>
            </div>
            <input type="file" className="hidden" onChange={onPick} accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-purple" />
              <p className="flex-1 truncate text-sm font-medium">{file.name}</p>
              <button
                onClick={() => { setFile(null); setResult(null); setError(null); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            {analyzing && (
              <div className="space-y-2">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full w-2/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-brand-purple to-transparent bg-[length:200%_100%]" />
                </div>
                <p className="text-xs text-muted-foreground">Sending to backend for legal analysis...</p>
              </div>
            )}
            
            {error && (
               <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                 <div className="mt-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
                   <ServerCrash className="h-4 w-4 shrink-0 mt-0.5" />
                   <span>{error}</span>
                 </div>
                 <p className="mt-1.5 text-[10px] text-muted-foreground px-1">Tip: set <code className="bg-secondary px-1 rounded">VITE_API_URL</code> in <code className="bg-secondary px-1 rounded">.env.local</code> to point to your backend.</p>
               </motion.div>
            )}

            {result && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5 text-xs"
              >
                <div className={cn("mt-2 rounded-lg border p-3", result.isLegal ? "border-success/30 bg-success/5 text-success" : "border-destructive/30 bg-destructive/5 text-destructive")}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {result.isLegal ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
                    {result.isLegal ? "Legal & Approved" : "Legal Issues Found"}
                    {result.riskLevel && (
                      <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase",
                        result.riskLevel === "low" ? "bg-success/20 text-success" :
                        result.riskLevel === "medium" ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      )}>{result.riskLevel} risk</span>
                    )}
                  </div>
                  <p className="mt-1">{result.message}</p>
                  
                  {result.details && result.details.length > 0 && (
                    <ul className="mt-2 list-inside list-disc opacity-80 pl-1 space-y-0.5">
                      {result.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}
