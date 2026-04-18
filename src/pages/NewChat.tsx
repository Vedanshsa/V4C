import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { useNavigate } from "react-router-dom";

const NewChat = () => {
  const clearChat = useAppStore((s) => s.clearChat);

  useEffect(() => {
    // Whenever a user visits /new, the chat is cleared to act as a distinct new chat session
    clearChat();
  }, [clearChat]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex min-w-0 flex-1">
        <div className="min-w-0 flex-1 h-full w-full">
          <ChatPanel />
        </div>
      </main>
    </div>
  );
};

export default NewChat;
