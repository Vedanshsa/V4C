import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { ShieldCheck, PhoneCall, Sparkles } from "lucide-react";

const Settings = () => {
  const profile = useAppStore((s) => s.profile);
  const userPlan = useAppStore((s) => s.userPlan);
  const tokens = useAppStore((s) => s.tokens);
  const setProfile = useAppStore((s) => s.setProfile);

  const upgrade = (plan: "starter" | "pro") => {
    openRazorpayCheckout(plan).catch(err => {
      alert("Checkout failed: " + err.message);
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold mb-6">Profile Settings</h1>
          <p className="text-muted-foreground mb-8">Update your workspace and jurisdiction settings here so our AI knows exactly which laws to enforce.</p>

          <div className="space-y-6">
            <div className="glass rounded-xl p-6 border border-border/60">
              <h2 className="text-xl font-semibold mb-4">Workspace Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Workspace Name</label>
                  <input type="text" className="w-full mt-1 bg-card border border-border rounded-lg px-4 py-2 outline-none focus:border-brand-purple" defaultValue="Acme Corp" />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Jurisdiction / Headquarter</label>
                  <select 
                    className="w-full mt-1 bg-card border border-border rounded-lg px-4 py-2 outline-none focus:border-brand-purple"
                    value={profile.businessType || ""}
                    onChange={(e) => setProfile({ businessType: e.target.value })}
                  >
                    <option value="in">India</option>
                    <option value="us">United States</option>
                    <option value="eu">European Union</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Billing && Subscription */}
            <div className="glass rounded-xl p-6 border border-border/60">
              <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
                <ShieldCheck className="h-5 w-5 text-brand-purple" /> Active Subscription
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between p-4 bg-secondary/50 rounded-xl border border-border/60">
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-brand-purple">
                    {userPlan === "free" ? "Freemium" : userPlan} Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have <span className="font-semibold text-foreground">{tokens}</span> AI tokens remaining.
                  </p>
                </div>
                
                {userPlan === "free" && (
                  <div className="flex gap-3">
                    <Button onClick={() => upgrade("starter")} className="bg-white text-brand-navy shadow-sm hover:bg-white/90">
                      Get Starter (₹999/mo)
                    </Button>
                    <Button onClick={() => upgrade("pro")} className="bg-gradient-brand text-white shadow-glow">
                      Get Pro (₹2499/mo) <Sparkles className="ml-1.5 h-4 w-4" />
                    </Button>
                  </div>
                )}
                {userPlan === "starter" && (
                  <Button onClick={() => upgrade("pro")} className="bg-gradient-brand text-white shadow-glow">
                    Upgrade to Pro (₹2499)
                  </Button>
                )}
                {userPlan === "pro" && (
                  <span className="text-sm font-semibold text-success bg-success/10 px-3 py-1 rounded-full">
                    Max Tier Unlocked
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border">
                  <PhoneCall className="h-5 w-5 text-brand-teal mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">AI Voice Call Hotline</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {userPlan === "free" 
                        ? "Limited to 3 inbound tracking calls." 
                        : userPlan === "starter"
                        ? "20 inbound calls / 10 outbound calls remaining this month."
                        : "Unlimited priority AI voice access enabled."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Button className="bg-gradient-brand text-white mt-4">Save Configuration</Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
