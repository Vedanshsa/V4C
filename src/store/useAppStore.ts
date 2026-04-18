import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ComplianceStatus = "completed" | "pending" | "risk" | "missing";

export interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  category: "tax" | "labor" | "data" | "license";
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "safe";
  title: string;
  impact: string;
  action: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai" | "system";
  content: string;
  timestamp: number;
  streaming?: boolean;
}

export interface OnboardingProfile {
  businessType: string;
  employees: string;
  dataUsage: string[];
  completed: boolean;
}

interface AppState {
  // auth & tokens
  isAuthenticated: boolean;
  tokens: number;
  userPlan: string;
  login: () => void;
  logout: () => void;
  deductToken: () => boolean;

  // onboarding
  profile: OnboardingProfile;
  setProfile: (p: Partial<OnboardingProfile>) => void;
  completeOnboarding: () => void;

  // compliance
  items: ComplianceItem[];
  updateItem: (id: string, status: ComplianceStatus) => void;
  setItems: (items: ComplianceItem[]) => void;

  // alerts
  alerts: Alert[];
  pushAlert: (a: Omit<Alert, "id" | "createdAt">) => void;
  dismissAlert: (id: string) => void;

  // chat
  messages: ChatMessage[];
  addMessage: (m: Omit<ChatMessage, "id" | "timestamp">) => string;
  appendToMessage: (id: string, chunk: string) => void;
  finalizeMessage: (id: string) => void;
  clearChat: () => void;

  // call
  callActive: boolean;
  callDuration: number;
  setCallActive: (b: boolean) => void;
  tickCall: () => void;
  resetCall: () => void;
}



export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userPlan: "free",
      tokens: 20,
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, userPlan: "free", tokens: 20, profile: { businessType: "", employees: "", dataUsage: [], completed: false } }),
      deductToken: () => {
        const current = get().tokens;
        if (current > 0) {
          set({ tokens: current - 1 });
          return true;
        }
        return false;
      },

      profile: { businessType: "", employees: "", dataUsage: [], completed: false },
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      completeOnboarding: () => {
        const profile = { ...get().profile, completed: true };
        set({ profile, items: [] });
      },

      items: [],
      setItems: (items) => set({ items }),
      updateItem: (id, status) =>
        set((s) => {
          const items = s.items.map((i) => (i.id === id ? { ...i, status } : i));
          return { items };
        }),

      alerts: [],
      pushAlert: (a) =>
        set((s) => ({
          alerts: [{ ...a, id: crypto.randomUUID(), createdAt: Date.now() }, ...s.alerts].slice(0, 8),
        })),
      dismissAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),

      messages: [],
      addMessage: (m) => {
        const id = crypto.randomUUID();
        set((s) => ({ messages: [...s.messages, { ...m, id, timestamp: Date.now() }] }));
        return id;
      },
      appendToMessage: (id, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, content: m.content + chunk, streaming: true } : m
          ),
        })),
      finalizeMessage: (id) =>
        set((s) => ({
          messages: s.messages.map((m) => (m.id === id ? { ...m, streaming: false } : m)),
        })),
      clearChat: () => set({ messages: [] }),

      callActive: false,
      callDuration: 0,
      setCallActive: (b) => set({ callActive: b, callDuration: b ? 0 : get().callDuration }),
      tickCall: () => set((s) => ({ callDuration: s.callDuration + 1 })),
      resetCall: () => set({ callActive: false, callDuration: 0 }),
    }),
    {
      name: "startup-guardian-auth",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        tokens: state.tokens,
        userPlan: state.userPlan,
        profile: state.profile,
      }),
    }
  )
);

