import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { Mail, Lock, ArrowRight, ShieldCheck, Phone, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn, signUp } from "@/lib/authService";
import { supabase } from "@/lib/supabase";

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAppStore();

  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      const plan = params.get("plan");

      if (isLogin) {
        // ── Sign In ──
        await signIn(email, password);
        login();
        if (redirect === "pricing") {
          navigate(`/pricing?checkout=${plan}`);
        } else {
          navigate("/dashboard");
        }
      } else {
        // ── Sign Up ──
        if (!phone.match(/^[6-9]\d{9}$/)) {
          setError("Please enter a valid 10-digit Indian mobile number.");
          setLoading(false);
          return;
        }
        const { user, session } = await signUp({ email, password, fullName, phone });
        
        if (session) {
          // If 'Confirm Email' is OFF in Supabase Dashboard, we get a session immediately
          login();
          if (redirect === "pricing") {
             navigate(`/pricing?checkout=${plan}`);
          } else {
             navigate("/dashboard");
          }
        } else {
          // If 'Confirm Email' is ON, we show the success message
          setSuccess("Account created! Check your email to confirm, then sign in.");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-hero flex flex-col justify-center">
      <div className="absolute inset-0 bg-grid opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
      <div className="absolute -top-32 left-1/3 h-72 w-72 rounded-full bg-brand-purple/25 blur-3xl animate-blob" />
      <div className="absolute top-20 right-1/4 h-56 w-56 rounded-full bg-brand-teal/20 blur-3xl animate-blob [animation-delay:4s]" />

      {/* Nav */}
      <header className="absolute top-0 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl z-10">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <button
            onClick={() => navigate("/")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </header>

      <main className="container relative z-10 flex flex-col items-center justify-center py-12 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Tab toggle */}
          <div className="mb-6 flex rounded-2xl border border-border/60 bg-card/60 p-1 backdrop-blur">
            {["Sign up", "Sign in"].map((label, i) => (
              <button
                key={label}
                onClick={() => { setIsLogin(i === 1); setError(null); setSuccess(null); }}
                className={cn(
                  "flex-1 rounded-xl py-2 text-sm font-medium transition-all",
                  (i === 1) === isLogin
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <Card className="glass-strong overflow-hidden p-8 md:p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-white mb-5">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-center">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              {isLogin
                ? "Sign in to access your legal workspace."
                : "Start checking documents for legal compliance instantly."}
            </p>

            {/* Notifications */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-5 flex items-start gap-2 rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm text-success"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    key="extra-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {/* Full name */}
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <input
                        type="text"
                        required={!isLogin}
                        placeholder="Full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-purple"
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <div className="absolute left-10 top-3 text-sm text-muted-foreground">+91</div>
                      <input
                        type="tel"
                        required={!isLogin}
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full rounded-xl border border-border bg-card py-2.5 pl-16 pr-4 text-sm outline-none transition-colors focus:border-brand-purple"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-purple"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  placeholder="Password (min 8 chars)"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-brand-purple"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-gradient-brand text-white shadow-glow hover:opacity-95 disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : isLogin
                    ? "Sign in to workspace"
                    : "Create free account"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              {isLogin ? "No account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
                className="font-semibold text-brand-purple hover:underline"
              >
                {isLogin ? "Sign up for free" : "Sign in"}
              </button>
            </p>

            {!isLogin && (
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                By signing up you agree to our Terms of Service. India-only service.
              </p>
            )}
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Auth;
