import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { ArrowLeft, ArrowRight, FileText, Globe, ShieldCheck, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const documentTypes = [
  { id: "contracts", label: "Client Contracts", icon: "📄" },
  { id: "vendors", label: "Vendor Agreements", icon: "🤝" },
  { id: "hr", label: "HR & Employment", icon: "👥" },
  { id: "policies", label: "Privacy / Terms", icon: "🔒" },
  { id: "nda", label: "NDAs", icon: "🤫" },
  { id: "other", label: "Other Legal Docs", icon: "📁" },
];

const jurisdictions = [
  { id: "in", label: "India (Bharat)", available: true, flag: "🇮🇳" },
];

const foreignCountries = [
  { label: "United States (US)", flag: "🇺🇸" },
  { label: "United Kingdom (UK)", flag: "🇬🇧" },
  { label: "European Union (EU)", flag: "🇪🇺" },
  { label: "Global / Multiple", flag: "🌐" },
];

const complianceGoals = [
  { id: "review", label: "Review existing documents for risks" },
  { id: "draft", label: "Ensure drafted contracts are compliant" },
  { id: "audit", label: "Prepare for legal due diligence / audit" },
  { id: "general", label: "Just exploring the platform" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, setProfile, completeOnboarding } = useAppStore();
  const [step, setStep] = useState(0);
  const [foreignSelected, setForeignSelected] = useState(false);

  // In the real app, we might save this differently. Reusing the profile state map.
  const canNext = [
    !!profile.businessType, // Using this for jurisdiction
    !!profile.employees,    // Using this for compliance goals
    profile.dataUsage.length > 0, // Using this for document types
  ][step];

  const finish = () => {
    completeOnboarding();
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-brand-purple/25 blur-3xl animate-blob" />

      <header className="relative border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Skip setup
          </button>
        </div>
      </header>

      <main className="container relative flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === step ? "w-12 bg-gradient-brand" : i < step ? "w-8 bg-brand-teal" : "w-8 bg-border"
                )}
              />
            ))}
          </div>

          <Card className="glass-strong overflow-hidden p-8 md:p-10">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="s0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-purple/10 text-brand-purple">
                      <Globe className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Step 1 of 3</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                    Where is your business headquartered?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    This helps our AI apply the correct local laws and data protection acts to your documents.
                  </p>

                  <div className="mt-8 space-y-3">
                    {/* India — only available jurisdiction */}
                    {jurisdictions.map((j) => {
                      const active = profile.businessType === j.id;
                      return (
                        <button
                          key={j.id}
                          onClick={() => { setProfile({ businessType: j.id }); setForeignSelected(false); }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                            active
                              ? "border-brand-purple bg-brand-purple/5 shadow-glow"
                              : "border-border bg-card hover:border-brand-purple/50 hover:bg-secondary/40"
                          )}
                        >
                          <span className="flex items-center gap-3 font-medium">
                            <span className="text-xl">{j.flag}</span> {j.label}
                          </span>
                          {active && <Check className="h-4 w-4 text-brand-purple" />}
                        </button>
                      );
                    })}

                    {/* Foreign countries — unavailable */}
                    <div className="mt-4">
                      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Other regions</p>
                      {foreignCountries.map((c) => (
                        <button
                          key={c.label}
                          onClick={() => setForeignSelected(true)}
                          className="mb-2 flex w-full items-center justify-between rounded-2xl border border-border/50 bg-card/40 p-4 text-left opacity-60 transition-all hover:opacity-80"
                        >
                          <span className="flex items-center gap-3 text-muted-foreground">
                            <span className="text-xl">{c.flag}</span> {c.label}
                          </span>
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {foreignSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-2xl border border-warning/40 bg-warning/5 p-4 text-sm text-warning"
                        >
                          <p className="font-semibold">🚫 Service not available in your region</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Startup Guardian currently operates exclusively within India (Bharat). Services for international jurisdictions are under development and will be announced when available.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="s1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Step 2 of 3</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                    What is your primary compliance goal?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    We'll customize your dashboard experience to prioritize the right verification paths.
                  </p>

                  <div className="mt-8 space-y-3">
                    {complianceGoals.map((g) => {
                      const active = profile.employees === g.id;
                      return (
                        <button
                          key={g.id}
                          onClick={() => setProfile({ employees: g.id })}
                          className={cn(
                            "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all",
                            active
                              ? "border-brand-purple bg-brand-purple/5 shadow-glow"
                              : "border-border bg-card hover:border-brand-purple/50 hover:bg-secondary/40"
                          )}
                        >
                          <span className="font-medium">{g.label}</span>
                          {active && <Check className="h-4 w-4 text-brand-purple" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="s2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Step 3 of 3</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight">
                    What types of documents will you analyze?
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Select all that apply. This prepares the system's extraction algorithms.
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {documentTypes.map((d) => {
                      const active = profile.dataUsage.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            const next = active
                              ? profile.dataUsage.filter((x) => x !== d.id)
                              : [...profile.dataUsage, d.id];
                            setProfile({ dataUsage: next });
                          }}
                          className={cn(
                            "group relative rounded-2xl border p-4 text-left transition-all",
                            active
                              ? "border-brand-purple bg-brand-purple/5 shadow-glow"
                              : "border-border bg-card hover:border-brand-purple/50 hover:bg-secondary/40"
                          )}
                        >
                          <div className="text-2xl">{d.icon}</div>
                          <div className="mt-2 text-sm font-medium">{d.label}</div>
                          {active && (
                            <Check className="absolute right-3 top-3 h-4 w-4 text-brand-purple" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>

              {step < 2 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canNext}
                  className="bg-gradient-brand text-white shadow-glow hover:opacity-95 disabled:opacity-50 disabled:shadow-none"
                >
                  Continue <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={finish}
                  disabled={!canNext}
                  className="bg-gradient-brand text-white shadow-glow hover:opacity-95 disabled:opacity-50 disabled:shadow-none"
                >
                  Enter workspace <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
