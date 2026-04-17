import { motion } from "framer-motion";
import { Check, Sparkles, Phone, PhoneIncoming, PhoneOutgoing, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { cn } from "@/lib/utils";
import { openRazorpayCheckout, loadRazorpayScript } from "@/lib/razorpay";
import { useEffect } from "react";

// ─────────────────────────────────────────────
// Plan definitions
// ─────────────────────────────────────────────

const tiers = [
  {
    name: "Free",
    tagline: "For solo founders",
    price: "₹0",
    period: "forever",
    highlight: false,
    badge: null,
    callBadge: "3 inbound only",
    callColor: "text-muted-foreground",
    features: [
      { text: "20 AI token credits / month", available: true },
      { text: "Document legal scan (PDF / DOCX)", available: true },
      { text: "Risk level report (Low / Medium / High)", available: true },
      { text: "3 inbound AI calls / month", available: true, tag: "Limited" },
      { text: "Outbound AI calls", available: false },
      { text: "Priority document queue", available: false },
      { text: "Dedicated account manager", available: false },
    ],
    cta: "Start for free",
    razorpay: false,
  },
  {
    name: "Starter",
    tagline: "Great for early-stage startups",
    price: "₹999",
    period: "/ month",
    highlight: false,
    badge: null,
    callBadge: "20 inbound + 10 outbound",
    callColor: "text-brand-teal",
    features: [
      { text: "200 AI token credits / month", available: true },
      { text: "Document legal scan (PDF / DOCX / Image)", available: true },
      { text: "Risk level report + detailed clause breakdown", available: true },
      { text: "20 inbound AI calls / month", available: true, tag: "Included" },
      { text: "10 outbound AI calls / month", available: true, tag: "Included" },
      { text: "Priority document queue", available: false },
      { text: "Dedicated account manager", available: false },
    ],
    cta: "Start 7-day trial",
    razorpay: true,
  },
  {
    name: "Pro",
    tagline: "For growing teams",
    price: "₹2,499",
    period: "/ month",
    highlight: true,
    badge: "Most Popular",
    callBadge: "Unlimited calls",
    callColor: "text-brand-purple",
    features: [
      { text: "Unlimited AI token credits", available: true },
      { text: "All document types incl. govt. forms", available: true },
      { text: "Full clause analysis + amendment suggestions", available: true },
      { text: "Unlimited inbound AI calls", available: true, tag: "Unlimited" },
      { text: "Unlimited outbound AI calls", available: true, tag: "Unlimited" },
      { text: "Priority document queue (< 30 sec)", available: true },
      { text: "Dedicated account manager", available: false },
    ],
    cta: "Start 14-day trial",
    razorpay: true,
  },
  {
    name: "Enterprise",
    tagline: "For multi-entity teams",
    price: "Custom",
    period: "",
    highlight: false,
    badge: null,
    callBadge: "Custom call pool",
    callColor: "text-brand-teal",
    features: [
      { text: "Custom AI token pool", available: true },
      { text: "White-labelled document reports", available: true },
      { text: "Full clause analysis + amendment suggestions", available: true },
      { text: "Custom inbound call pool (SLA-backed)", available: true, tag: "Custom" },
      { text: "Unlimited outbound AI calls", available: true, tag: "Unlimited" },
      { text: "Priority queue + 24/7 SLA", available: true },
      { text: "Dedicated account manager", available: true },
    ],
    cta: "Talk to sales",
    razorpay: false,
  },
];

// ─────────────────────────────────────────────
// Razorpay Action
// ─────────────────────────────────────────────

const handleRazorpay = async (plan: typeof tiers[number]) => {
  if (!plan.razorpay) {
    if (plan.price === "₹0") { window.location.href = "/auth"; return; }
    alert("Contact our sales team at sales@startupguardian.in to set up Enterprise billing.");
    return;
  }

  const planId = plan.name.toLowerCase() as "starter" | "pro";
  
  try {
    console.log(`Initiating checkout for ${planId}...`);
    await openRazorpayCheckout(planId);
  } catch (err: any) {
    console.error("Razorpay Error:", err);
    alert("Failed to initiate checkout: " + err.message);
  }
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const Pricing = () => {
  useEffect(() => { loadRazorpayScript().catch(() => {}); }, []);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* ── Header ── */}
      <section className="bg-gradient-hero border-b border-border/40">
        <div className="container py-16 md:py-24 text-center">
          <motion.div {...fade(0)} className="mx-auto max-w-2xl">
            <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
              Simple pricing · Cancel anytime · India-only service
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Pricing that <span className="text-gradient">grows with you</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free and upgrade when your legal needs get serious. <strong>All AI services are plan-dependent.</strong>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Call service notice ── */}
      <div className="border-b border-border/60 bg-secondary/30">
        <div className="container py-5">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <PhoneIncoming className="h-4 w-4 text-brand-teal" />
              <strong>Inbound</strong> — Ask questions on <strong className="text-foreground">9999999999</strong>
            </span>
            <span className="flex items-center gap-2">
              <PhoneOutgoing className="h-4 w-4 text-brand-purple" />
              <strong>Outbound</strong> — Proactive compliance alerts
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              Free plan: <strong className="text-foreground">3 inbound/mo</strong> only
            </span>
          </div>
        </div>
      </div>

      {/* ── Plans ── */}
      <section className="container py-14 md:py-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={cn("group relative transition-all duration-300", t.highlight && "lg:-mt-6")}
            >
              {t.badge && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 + 0.4, type: "spring" }}
                  className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-brand px-4 py-1 text-xs font-bold text-white shadow-glow"
                >
                  {t.badge}
                </motion.div>
              )}
              <Card
                className={cn(
                  "relative flex h-full flex-col overflow-hidden p-6 transition-all duration-300",
                  t.highlight
                    ? "border-transparent shadow-elegant ring-2 ring-brand-purple/50 bg-gradient-to-br from-card to-brand-purple/5"
                    : "border-border/60 hover:border-brand-purple/30 group-hover:shadow-card"
                )}
              >
                {t.highlight && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-brand opacity-15 blur-3xl animate-pulse" />
                    <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-brand-teal/10 blur-3xl" />
                  </div>
                )}

                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-widest text-brand-purple/80">{t.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80 leading-relaxed">{t.tagline}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={cn("text-4xl font-bold tracking-tight", t.highlight && "text-gradient")}>{t.price}</span>
                    {t.period && <span className="text-sm font-medium text-muted-foreground">{t.period}</span>}
                  </div>
                </div>

                <div className="relative mt-5 flex items-center gap-2.5 rounded-xl border border-brand-purple/10 bg-brand-purple/5 px-3.5 py-2.5 text-xs">
                  <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-sm", t.callColor)}>
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <span className={cn("font-semibold", t.callColor)}>{t.callBadge}</span>
                </div>

                <ul className="relative mt-6 flex-1 space-y-3.5">
                  {t.features.map((f, idx) => (
                    <motion.li 
                      key={f.text} 
                      initial={{ opacity: 0, x: -5 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + idx * 0.05 + 0.3 }}
                      className={cn("flex items-start gap-3 text-sm", !f.available && "opacity-40")}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full",
                        f.available ? (t.highlight ? "bg-brand-teal/10 text-brand-teal" : "bg-success/10 text-success") : "bg-muted text-muted-foreground"
                      )}>
                        <Check className="h-3 w-3 bold" />
                      </div>
                      <span className="flex-1 leading-snug">{f.text}</span>
                      {f.available && f.tag && (
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-tighter",
                          f.tag === "Limited" ? "bg-warning/15 text-warning" :
                          f.tag === "Unlimited" ? "bg-brand-purple/15 text-brand-purple" :
                          "bg-success/15 text-success"
                        )}>
                          {f.tag}
                        </span>
                      )}
                    </motion.li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleRazorpay(t)}
                  className={cn(
                    "relative mt-8 w-full font-semibold transition-all duration-300",
                    t.highlight
                      ? "bg-gradient-brand text-white shadow-glow hover:shadow-brand-purple/40 hover:scale-[1.02]"
                      : "hover:bg-brand-purple/5 hover:text-brand-purple hover:border-brand-purple/30"
                  )}
                  variant={t.highlight ? "default" : "outline"}
                  size="lg"
                >
                  {t.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mx-auto mt-16 max-w-2xl text-center text-sm text-muted-foreground"
        >
          All plans include encrypted document storage, jurisdiction-aware analysis (India only), and access to call number <strong className="text-foreground">9999999999</strong>.
          Calls outside India are not supported. Razorpay is the exclusive payment processor.
        </motion.p>
      </section>

      {/* ── Call service explainer ── */}
      <section className="border-t border-border/60 bg-secondary/20">
        <div className="container py-14 md:py-20">
          <motion.div {...fade(0)} className="mx-auto max-w-2xl text-center mb-10">
            <h2 className="font-display text-2xl font-bold md:text-4xl">How AI Call Services Work</h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Our AI call service is exclusive to India. You must be on a paid plan to access outbound calls.
            </p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {[
              {
                icon: PhoneIncoming,
                color: "text-brand-teal",
                bg: "bg-brand-teal/10",
                title: "Inbound Calls",
                desc: "Call 9999999999 anytime to ask legal questions about your documents. Free users get 3 calls/month. Starter & above get expanded quotas. Pro gets unlimited.",
                restrict: "Free plan: 3 calls/month",
              },
              {
                icon: PhoneOutgoing,
                color: "text-brand-purple",
                bg: "bg-brand-purple/10",
                title: "Outbound Calls",
                desc: "Our AI proactively calls you when a compliance deadline is near or a document analysis flags a critical issue. Only available on Starter plan and above.",
                restrict: "Free plan: Not included",
              },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-border/60 p-7 h-full hover:shadow-elegant transition-shadow">
                  <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-2xl", item.bg, item.color)}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  <div className="mt-6 flex items-center gap-2 rounded-xl bg-secondary/80 px-4 py-2 text-xs font-semibold text-muted-foreground">
                    <Lock className="h-3.5 w-3.5" /> {item.restrict}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default Pricing;
