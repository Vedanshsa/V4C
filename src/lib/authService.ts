/**
 * Supabase Auth & Profile service for Voice-4-Compliance
 * Handles: sign up, sign in, sign out, profile read/write
 */

import { supabase } from "./supabase";
import type { Database } from "./database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export async function signUp({ email, password, fullName, phone }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error) throw error;

  // Create profile row immediately after signup
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      phone,
      full_name: fullName,
      plan: "free",
      tokens_remaining: 20,
      inbound_calls_used: 0,
      inbound_calls_limit: 3,
      outbound_calls_used: 0,
      outbound_calls_limit: 0,
      jurisdiction: "in",
      trial_used: false,
      subscription_end_date: null,
    });

    if (profileError) console.error("Profile creation error:", profileError.message);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) { console.error("getProfile error:", error.message); return null; }
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}

// ─────────────────────────────────────────────
// Chat history
// ─────────────────────────────────────────────

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  role: "user" | "ai" | "system",
  content: string
) {
  await supabase.from("chat_history").insert({ user_id: userId, session_id: sessionId, role, content });
}

export async function getChatHistory(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from("chat_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}

// ─────────────────────────────────────────────
// Document scan history
// ─────────────────────────────────────────────

export async function saveDocumentScan(
  userId: string,
  filename: string,
  isLegal: boolean,
  message: string,
  riskLevel: "low" | "medium" | "high" | null,
  details: string[],
  jurisdiction = "in"
) {
  await supabase.from("document_scans").insert({
    user_id: userId,
    filename,
    is_legal: isLegal,
    message,
    risk_level: riskLevel,
    details,
    jurisdiction,
  });
}

export async function getDocumentScans(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from("document_scans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
