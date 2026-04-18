/**
 * Razorpay integration for Voice-4-Compliance
 *
 * SECURITY NOTES:
 *  - Only the Key ID (public) is used in the frontend.
 *  - The Secret (Togsl4GYtS5YeUQ2ObDwlXwL) must ONLY live on the FastAPI backend
 *    and be used to verify payment signatures server-side.
 *
 * Backend endpoint your friend needs to implement:
 *  POST /create-razorpay-order
 *    Body: { amount: number, plan: string, user_id: string }
 *    Returns: { order_id: string, amount: number, currency: string }
 *
 *  POST /verify-razorpay-payment
 *    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 *    Returns: { success: boolean }
 */

import { supabase } from "./supabase";
import { API_BASE } from "./api";
import { useAppStore } from "@/store/useAppStore";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name?: string; email?: string; contact?: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

// ─────────────────────────────────────────────
// Load Razorpay checkout.js script
// ─────────────────────────────────────────────

let scriptLoaded = false;

export function loadRazorpayScript(): Promise<void> {
  if (scriptLoaded || window.Razorpay) { scriptLoaded = true; return Promise.resolve(); }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });
}

// ─────────────────────────────────────────────
// Plan details (keep in sync with Pricing.tsx)
// ─────────────────────────────────────────────

export const PLAN_PRICES: Record<string, number> = {
  starter: 999,
  pro: 2499,
};

// ─────────────────────────────────────────────
// Open Razorpay checkout
// ─────────────────────────────────────────────

export async function openRazorpayCheckout(plan: "starter" | "pro"): Promise<void> {
  await loadRazorpayScript();

  const { data: { user } } = await supabase.auth.getUser();

  // STRICT REQUIREMENT: User must be signed in to purchase a premium plan
  if (!user) {
    alert("Please sign in to continue with your purchase.");
    window.location.href = `/auth?redirect=pricing&plan=${plan}`;
    return;
  }

  console.log(`Initiating Razorpay for plan: ${plan}, user: ${user.id}`);

  let orderId = "";
  let amount = PLAN_PRICES[plan] * 100; // paise

  // Try to get a real order from the backend with a 3-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/create-razorpay-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        plan,
        user_id: user.id,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (res.ok) {
      const order = await res.json();
      orderId = order.order_id;
      amount = order.amount;
    }
  } catch (err) {
    console.warn("Backend order creation skipped/offline. Proceeding with standard checkout.");
  }

  if (!window.Razorpay) {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
    return;
  }

  const options: any = {
    key: (import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SehDTzdgNAwyc7") as string,
    amount,
    currency: "INR",
    name: "Startup Guardian",
    description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - AI Legal Copilot`,
    ...(orderId ? { order_id: orderId } : {}),
    prefill: {
      name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      contact: user?.user_metadata?.phone || "",
    },
    theme: { color: "#8B5CF6" },
    handler: async (response: any) => {
      console.log("Razorpay Success Response:", response);

      
      try {
        // 1. Record the payment in Supabase
        await supabase.from("payments").insert({
          user_id: user.id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          plan,
          amount: amount / 100,
          currency: "INR",
          status: "paid",
        });

        // 2. Update user's profile with the new plan and token allocation
        // Pro = Unlimited (999999), Starter = 200
        const tokens = plan === "pro" ? 999999 : 200;
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);
        
        await supabase.from("profiles").update({
          plan,
          tokens_remaining: tokens,
          subscription_end_date: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", user.id);
        
        // 3. Update local Zustand state for immediate UI feedback
        useAppStore.setState({ userPlan: plan, tokens });

        alert(`Success! Your ${plan.toUpperCase()} plan is now active.`);
        window.location.href = "/dashboard";
      } catch (err) {
        console.error("Post-payment sync error:", err);
        alert("Payment was successful but we couldn't sync your profile automatically. Please refresh or contact support.");
      }
    },
    modal: {
      ondismiss: () => {
        console.log("Razorpay window closed by user.");
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Failed to open Razorpay:", err);
    alert("Error opening checkout. Please try again.");
  }
}
