import { useAppStore } from "@/store/useAppStore";
import { getCurrentUser, saveChatMessage } from "./authService";
import { sendChatMessage } from "./api";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function streamMessage(content: string, perChunk = 18) {
  const store = useAppStore.getState();
  const id = store.addMessage({ role: "ai", content: "", streaming: true });
  const words = content.split(/(\s+)/);
  let buf = "";
  for (let i = 0; i < words.length; i++) {
    buf += words[i];
    if (buf.length >= perChunk || i === words.length - 1) {
      useAppStore.getState().appendToMessage(id, buf);
      buf = "";
      await sleep(30 + Math.random() * 50);
    }
  }
  useAppStore.getState().finalizeMessage(id);
}

export async function runDemoScenario() {
  const { profile } = useAppStore.getState();
  const businessLabel = profile.businessType ? `${profile.businessType.toUpperCase()} startup` : "startup";

  await sleep(400);

  await streamMessage(
    `Welcome 👋 I've analyzed your ${businessLabel} profile. I am your Compliance Copilot designed to assist with your regulatory needs.\n\nHow can I help you today?`
  );
}

const responses: { match: RegExp; reply: string; effect?: () => void }[] = [
  {
    match: /privacy|policy|dpdp/i,
    reply: "I can draft a DPDP-compliant Privacy Policy tailored to your data flows. It covers: lawful basis, consent, retention, breach notification, and Data Principal rights. Want me to generate it now?",
    effect: () => {
      useAppStore.getState().updateItem("privacy", "pending");
      useAppStore.getState().pushAlert({
        severity: "safe",
        title: "Privacy Policy draft ready",
        impact: "Reduces DPDP exposure significantly.",
        action: "Review & publish",
      });
    },
  },
  {
    match: /gst/i,
    reply: "GST registration is online via gst.gov.in. You'll need: PAN, Aadhaar, business address proof, bank details. I can pre-fill the form. Marked as in progress.",
    effect: () => {
      useAppStore.getState().updateItem("gst", "completed");
    },
  },
  {
    match: /pf|epfo|provident/i,
    reply: "EPFO registration takes ~7 days. You'll need: PAN, business proof, employee details. Employer contributes 12% of basic. I'll mark this as in progress.",
    effect: () => {
      useAppStore.getState().updateItem("pf", "pending");
    },
  },
  {
    match: /score|how am i doing/i,
    reply: `Score checking is disabled for this profile. You can upload a document to proceed.`,
  },
  {
    match: /shop|establishment/i,
    reply: "Shop & Establishment registration is state-specific. For Karnataka, it's online via Sevasindhu. Typically issued within 7 days.",
    effect: () => useAppStore.getState().updateItem("shopact", "pending"),
  },
];

export async function sendUserMessage(text: string, opts?: { isVoice?: boolean }) {
  const store = useAppStore.getState();
  const sessionId = "session_default"; // In a full app, generate & store per-conversation ID
  
  // 1. Add user msg to Zustand UI
  store.addMessage({ role: "user", content: text });
  
  // 2. Save user msg to Supabase (Background)
  getCurrentUser().then(user => {
    if (user) saveChatMessage(user.id, sessionId, "user", text).catch(console.error);
  });

  try {
    // 3. Get response from real FastAPI backend
    const data = await sendChatMessage(text, sessionId, { 
      businessType: store.profile.businessType,
      dataUsage: store.profile.dataUsage
    });
    
    // 4. Stream response to UI
    await streamMessage(data.reply);
    
    // 5. Save AI msg to Supabase (Background)
    getCurrentUser().then(user => {
      if (user) saveChatMessage(user.id, data.session_id || sessionId, "ai", data.reply).catch(console.error);
    });

  } catch (err: any) {
    console.error("Chat backend error:", err);
    // Fallback if backend is down
    const fallbackText = "Sorry, I couldn't reach the backend server. Please verify your FastAPI server is running.";
    await streamMessage(fallbackText);
  }
}

