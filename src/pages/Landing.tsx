import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import {
  ArrowRight, ShieldCheck, Phone, Sparkles, AlertTriangle, CheckCircle2,
  Lock, Eye, Mail, FileText, Zap, BarChart3
} from "lucide-react";
import { SplitText } from "@/components/animations/SplitText";
import { TextType } from "@/components/animations/TextType";
import { AnimatedList } from "@/components/animations/AnimatedList";
import { AnimatedContent } from "@/components/animations/AnimatedContent";
import ShinyText from "@/components/animations/ShinyText";
import { Suspense, lazy, useState, useEffect, Component, type ReactNode } from "react";

const MagicRings = lazy(() => import("@/components/animations/MagicRings"));

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function HeroAnimation() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <MagicRings
          color="#8B5CF6"
          colorTwo="#06B6D4"
          ringCount={8}
          speed={0.8}
          attenuation={12}
          lineThickness={2.5}
          baseRadius={0.4}
          radiusStep={0.08}
          scaleRate={0.15}
          opacity={0.8}
          noiseAmount={0.05}
          followMouse={true}
          mouseInfluence={0.15}
          hoverScale={1.1}
          parallax={0.03}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60 scale-125">
          <HeroAnimation />
        </div>
        <div className="absolute inset-0 z-0 bg-grid opacity-[0.2] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-brand-purple/20 blur-3xl animate-blob" />
        <div className="absolute top-20 right-1/4 h-72 w-72 rounded-full bg-brand-teal/20 blur-3xl animate-blob [animation-delay:4s]" />

        <div className="container relative pb-20 pt-16 md:pb-28 md:pt-24">
          <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-purple" />
              AI Legal Document Analyzer · Built for startups
            </div>
            <h1 className="relative z-10 font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              <SplitText text="Verify legal terms." className="justify-center" delay={0.1} />
              <br />
              <ShinyText text="Without hiring a lawyer." className="text-gradient" speed={3} />
            </h1>
            <div className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl text-center">
              <TextType
                text="Startup Guardian analyzes your documents and tells you instantly what is legal, what risks you have, and what to enforce in seconds."
                delay={0.5}
                speed={0.02}
              />
            </div>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-12 bg-gradient-brand px-8 text-base text-white shadow-glow hover:translate-y-[-2px] transition-transform">
                <Link to="/auth">
                  Get started for free <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 border-border/60 hover:bg-secondary/50">
                View Sample Scan
              </Button>
            </div>
            <p className="mt-6 text-xs font-medium text-muted-foreground/80 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /> 30-second setup</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success" /> Free forever plan</span>
            </p>
          </motion.div>

          {/* Hero product preview */}
          <motion.div {...fade(0.2)} className="relative mx-auto mt-16 max-w-5xl">
            <div className="absolute inset-0 -z-10 bg-gradient-brand opacity-20 blur-3xl" />
            <div className="rounded-3xl border border-border bg-card p-2 shadow-elegant">
              <div className="rounded-2xl bg-gradient-to-br from-secondary/50 to-background p-4 md:p-8">
                  {/* Chat preview */}
                  <div className="glass rounded-2xl p-6 shadow-elegant">
                    <div className="space-y-4 text-sm md:text-base">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md bg-secondary px-5 py-3 shadow-sm">
                          You have <span className="font-semibold text-destructive">2 critical risks</span>: missing Privacy Policy and unregistered PF for 22 employees.
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
                          <AlertTriangle className="h-4 w-4" />
                        </div>
                        <div className="rounded-2xl rounded-tl-md border border-warning/30 bg-warning/5 px-5 py-3 shadow-sm">
                          <span className="font-semibold">Action:</span> File EPFO registration before April 30 to avoid ₹50k+ penalty.
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section className="container py-20 md:py-28">
        <motion.div {...fade()} className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-brand-purple">An AI Legal Team, not a checklist</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
            Three things you'll know instantly
          </h2>
          <p className="mt-4 text-muted-foreground">
            Drop your contract and we handle the legal parsing.
          </p>
        </motion.div>

        <AnimatedList className="mt-12 grid gap-5 md:grid-cols-3" delay={0.2} staggerDelay={0.1}>
          {[
            {
              icon: ShieldCheck,
              tint: "from-brand-purple/15 to-brand-blue/10",
              ring: "text-brand-purple",
              title: "Is it legally sound?",
              desc: "Ensure your commercial agreements, HR paperwork, and NDAs comply with your jurisdiction's latest laws.",
            },
            {
              icon: AlertTriangle,
              tint: "from-destructive/15 to-warning/10",
              ring: "text-destructive",
              title: "What risks are hidden?",
              desc: "Deep document extraction identifies loop holes and missing clauses like Data Protection liabilities.",
            },
            {
              icon: Zap,
              tint: "from-brand-teal/15 to-brand-green/10",
              ring: "text-brand-teal",
              title: "What to do next",
              desc: "Prioritized legal action items. Know exactly what sections to amend before you sign.",
            },
          ].map((f, i) => (
            <Card key={f.title} className="group relative h-full overflow-hidden border-border/60 p-7 transition-all hover:-translate-y-1 hover:shadow-elegant">
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${f.tint} blur-2xl`} />
              <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary ${f.ring}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="relative mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </AnimatedList>
      </section>

      {/* VOICE FEATURE */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="container grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
          <motion.div {...fade()}>
            <p className="text-sm font-semibold text-brand-teal">Live Document Chat</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-5xl">
              Just talk to your contracts.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Drop a PDF and use voice or text to query clauses, pinpoint liabilities,
              or ask questions about specific terms.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Instant clause extractions",
                "Flag missing data protection laws",
                "Verify complex commercial jargon",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-8 bg-gradient-brand text-white shadow-glow hover:opacity-95">
              <a href="tel:9999999999">Call AI: 9999999999 <Phone className="ml-2 h-4 w-4" /></a>
            </Button>
          </motion.div>

          <motion.div {...fade(0.15)} className="relative">
            <div className="glass-strong relative aspect-square w-full max-w-md mx-auto rounded-3xl p-8">
              <div className="flex h-full flex-col items-center justify-center">
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-brand-purple/30 animate-pulse-ring" />
                  <span className="absolute inset-0 rounded-full bg-brand-teal/30 animate-pulse-ring [animation-delay:0.7s]" />
                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-brand text-white shadow-glow">
                    <Phone className="h-9 w-9" />
                  </div>
                </div>
                <div className="mt-10 flex h-16 items-end gap-1.5">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 origin-bottom rounded-full bg-gradient-brand animate-wave"
                      style={{
                        height: `${20 + ((i * 13) % 50)}%`,
                        animationDelay: `${(i % 8) * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-8 text-center text-xl font-bold text-gradient">
                  9999999999
                </p>
                <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                  Available 24/7 for legal queries
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20 md:py-28">
        <motion.div {...fade()} className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
            From zero to compliant in 3 steps
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: "01", icon: FileText, title: "Setup your profile", d: "Tell us about your jurisdiction and document types." },
            { n: "02", icon: BarChart3, title: "Drop a document", d: "Upload a PDF or Word document into your local workspace." },
            { n: "03", icon: ShieldCheck, title: "Receive legal verdict", d: "Our connected legal backend instantly analyzes all terms." },
          ].map((s, i) => (
            <motion.div key={s.n} {...fade(i * 0.1)}>
              <Card className="h-full border-border/60 p-7">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-muted-foreground">{s.n}</span>
                  <s.icon className="h-5 w-5 text-brand-purple" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRIVACY */}
      <section className="border-y border-border/60 bg-gradient-to-b from-background to-secondary/40">
        <div className="container py-20 md:py-24">
          <motion.div {...fade()} className="mx-auto max-w-2xl text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
              Your data stays your data
            </h2>
            <p className="mt-3 text-muted-foreground">
              We're a copilot, not a snoop. Built with the strictest data minimization.
            </p>
          </motion.div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-3 md:grid-cols-3">
            {[
              { icon: Lock, t: "Never access your bank data" },
              { icon: Mail, t: "Never read your emails" },
              { icon: Eye, t: "Encrypted end-to-end" },
            ].map((p, i) => (
              <motion.div key={p.t} {...fade(i * 0.08)}>
                <Card className="flex items-center gap-3 border-border/60 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                    <p.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium">{p.t}</span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 md:py-28">
        <AnimatedContent direction="scale" delay={0.1} distance={0}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-brand p-10 text-center shadow-glow md:p-16">
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative mx-auto max-w-2xl text-white">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
                Start scanning your legal documents
              </h2>
              <p className="mt-4 text-white/85">
                Protect your startup from liabilities before you sign anything.
              </p>
              <Button asChild size="lg" className="mt-8 h-12 bg-white px-8 text-base text-brand-navy hover:bg-white/90">
                <Link to="/onboarding">
                  Start free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedContent>
      </section>

      <MarketingFooter />
    </div>
  );
};

export default Landing;
