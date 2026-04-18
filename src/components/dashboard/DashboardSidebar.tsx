import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { MessageSquare, ShieldCheck, Settings, History, LogOut, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const items = [
  { to: "/dashboard", label: "Document Checker", icon: ShieldCheck, badge: "live" },
  { to: "/new", label: "New Chat", icon: MessageSquare },
  { to: "/history", label: "Analysis History", icon: History },
];

import { signOut } from "@/lib/authService";

export function DashboardSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const tokens = useAppStore((s) => s.tokens);
  const userPlan = useAppStore((s) => s.userPlan);
  const logout = useAppStore((s) => s.logout);

  const tokenLimit = userPlan === "pro" ? "Unlimited" : userPlan === "starter" ? 200 : 20;

  const handleLogout = async () => {
    try {
      await signOut(); // Clear Supabase session
    } catch {}
    logout(); // Clear Zustand state locally
    navigate("/auth");
  };

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
      <div className="border-b border-sidebar-border/60 px-4 py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Startup Guardian home">
          <Logo variant="white" />
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((it, i) => {
          const active = pathname === it.to || (it.to === "/dashboard" && pathname === "/dashboard");
          return (
            <Link
              key={it.label}
              to={it.to}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-white"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white"
              )}
            >
              <it.icon className="h-4 w-4" />
              <span className="flex-1">{it.label}</span>
              {it.badge && (
                <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-success">
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Token status */}
      <div className="px-4 py-4 border-t border-sidebar-border/60">
        <div className="rounded-2xl bg-sidebar-accent/60 p-3 shadow-sm border border-white/5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-sidebar-foreground/60">AI Legal Capacity</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">
              {userPlan === "pro" ? "Inf" : tokens}
            </span>
            <span className="text-xs text-sidebar-foreground/50">/ {tokenLimit === "Unlimited" ? "∞" : tokenLimit}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-background">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700", 
                userPlan === "pro" ? "bg-gradient-to-r from-brand-purple to-brand-teal" : 
                tokens > (typeof tokenLimit === "number" ? tokenLimit * 0.2 : 5) ? "bg-gradient-brand" : "bg-destructive"
              )}
              style={{ width: userPlan === "pro" ? "100%" : `${(tokens / (typeof tokenLimit === "number" ? tokenLimit : 20)) * 100}%` }}
            />
          </div>
          <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-teal" />
            <span className="text-[10px] font-semibold text-sidebar-foreground/80 uppercase">
              Active Services: {userPlan === "pro" ? "4 (All)" : userPlan === "starter" ? "3" : "1"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 bg-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white shadow-glow">
            {profile.businessType ? profile.businessType.slice(0, 2).toUpperCase() : "SG"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white uppercase tracking-tight">
              {profile.businessType ? `${profile.businessType} Branch` : "Main Workspace"}
            </p>
            <p className={cn(
              "truncate text-[10px] font-bold uppercase tracking-wider",
              userPlan === "pro" ? "text-brand-purple" : 
              userPlan === "starter" ? "text-brand-teal" : "text-sidebar-foreground/50"
            )}>
              {userPlan.toUpperCase()} PLAN
            </p>
          </div>
        </div>
        <div className="mt-1 flex">
          <Link to="/settings" className="flex flex-1 items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white">
            <Settings className="h-3.5 w-3.5" /> Settings
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" /> Exit
          </button>
        </div>
      </div>
    </aside>
  );
}
