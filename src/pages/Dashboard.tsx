import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { CompliancePanel } from "@/components/dashboard/CompliancePanel";

const Dashboard = () => {
  const profile = useAppStore((s) => s.profile);
  const items = useAppStore((s) => s.items);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setProfile = useAppStore((s) => s.setProfile);

  // If no items yet (user landed directly), seed with a demo profile
  useEffect(() => {
    if (items.length === 0) {
      if (!profile.businessType) {
        setProfile({
          businessType: "fintech",
          employees: "20",
          dataUsage: ["personal", "payment"],
        });
      }
      // Defer to next tick so setProfile commits
      setTimeout(() => completeOnboarding(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1">
        <div className="min-w-0 flex-1">
          <ChatPanel />
        </div>
        <div className="hidden w-[360px] shrink-0 lg:block">
          <CompliancePanel />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
