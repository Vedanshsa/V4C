// Auto-generated Supabase database types for Voice-4-Compliance
// Run `npx supabase gen types typescript` to regenerate after schema changes.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;               // matches auth.users.id (UUID)
          email: string;
          phone: string | null;
          full_name: string | null;
          plan: "free" | "starter" | "pro" | "enterprise";
          tokens_remaining: number;
          inbound_calls_used: number;
          inbound_calls_limit: number;
          outbound_calls_used: number;
          outbound_calls_limit: number;
          jurisdiction: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      chat_history: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          role: "user" | "ai" | "system";
          content: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_history"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["chat_history"]["Insert"]>;
      };

      document_scans: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          is_legal: boolean;
          message: string;
          risk_level: "low" | "medium" | "high" | null;
          details: string[];
          jurisdiction: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["document_scans"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["document_scans"]["Insert"]>;
      };

      payments: {
        Row: {
          id: string;
          user_id: string;
          razorpay_order_id: string;
          razorpay_payment_id: string | null;
          plan: string;
          amount: number;
          currency: string;
          status: "created" | "paid" | "failed";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
      };
    };
  };
}
