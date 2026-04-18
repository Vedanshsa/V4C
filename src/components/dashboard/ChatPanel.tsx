import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore, type ChatMessage } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Send, Mic, Sparkles, AlertTriangle, ShieldCheck, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { runDemoScenario, sendUserMessage } from "@/lib/aiSimulator";

export function ChatPanel() {
  const messages = useAppStore((s) => s.messages);
  const tokens = useAppStore((s) => s.tokens);
  const userPlan = useAppStore((s) => s.userPlan);
  const deductToken = useAppStore((s) => s.deductToken);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Run intro scenario once
  useEffect(() => {
    if (!startedRef.current && messages.length === 0) {
      startedRef.current = true;
      runDemoScenario();
    }
  }, [messages.length]);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || busy) return;
    
    if (!deductToken()) {
      alert("You are out of tokens! Please upgrade your plan.");
      return;
    }

    const text = input.trim();
    setInput("");
    setBusy(true);
    await sendUserMessage(text);
    setBusy(false);
  };



  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold leading-none">Copilot Chat</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Always-on legal assistant
            </p>
          </div>
        </div>

        {/* Call History Dropdown/Summary */}
        <div className="hidden md:flex items-center gap-2 border-r border-border/60 pr-4 mr-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Recent Calls</span>
            <span className="text-xs font-medium text-foreground">3 made (2m 14s avg)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end mr-3">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              userPlan === "pro" ? "text-brand-purple" : 
              userPlan === "starter" ? "text-brand-teal" : "text-muted-foreground"
            )}>
              {userPlan} Plan
            </span>
            <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-tighter">
              Energy: <span className="font-bold text-foreground">{userPlan === "pro" ? "Unlimited" : tokens}</span>
            </span>
          </div>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gradient-brand text-white shadow-glow hover:opacity-95"
          >
            <a href="tel:+911171366946">Call AI (+91 1171366946)</a>
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-border/60 bg-background px-4 py-4 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-card focus-within:border-brand-purple/60 focus-within:ring-2 focus-within:ring-brand-purple/20">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask anything about the document..."
              className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button
              onClick={send}
              disabled={!input.trim() || busy || tokens <= 0}
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-brand text-white hover:opacity-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            AI guidance is informational. For legal certainty, consult a lawyer.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-sm leading-relaxed">{m.content}</p>
      </motion.div>
    );
  }

  if (m.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end"
      >
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-gradient-brand px-4 py-2.5 text-sm text-white shadow-card">
          {m.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-white">
        <ShieldCheck className="h-4 w-4" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-border bg-card px-4 py-2.5 text-sm shadow-card">
        <span className="whitespace-pre-wrap">{m.content}</span>
        {m.streaming && (
          <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-brand-purple" />
        )}
      </div>
    </motion.div>
  );
}
