/**
 * Startup Guardian — FastAPI Backend Client
 *
 * Base URL is read from the VITE_API_URL environment variable at build time.
 * Fall back to localhost:8000 for local development.
 *
 * Your friend's FastAPI server should expose these endpoints:
 *
 *  POST /analyze-document
 *    Body: multipart/form-data  { file: <File>, jurisdiction: string, document_types: string[] }
 *    Returns: { is_legal: boolean, message: string, details: string[], risk_level: "low"|"medium"|"high" }
 *
 *  POST /chat
 *    Body: JSON { message: string, session_id?: string, context?: object }
 *    Returns: { reply: string, session_id: string }
 *
 *  GET /health
 *    Returns: { status: "ok", version: string }
 */

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AnalysisResult {
  is_legal: boolean;
  message: string;
  details: string[];
  risk_level: "low" | "medium" | "high";
}

export interface ChatReply {
  reply: string;
  session_id: string;
}

export interface HealthCheck {
  status: string;
  version?: string;
}

// ─────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Backend error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.detail) msg = body.detail;
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// API functions
// ─────────────────────────────────────────────

/**
 * Upload a document for legal analysis.
 */
export async function analyzeDocument(
  file: File,
  jurisdiction: string = "in",
  documentTypes: string[] = []
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("jurisdiction", jurisdiction);
  documentTypes.forEach((t) => formData.append("document_types", t));

  const res = await fetch(`${API_BASE}/analyze-document`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<AnalysisResult>(res);
}

/**
 * Send a chat message to the AI legal copilot.
 */
export async function sendChatMessage(
  message: string,
  sessionId?: string,
  context?: Record<string, unknown>
): Promise<ChatReply> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId, context }),
  });

  return handleResponse<ChatReply>(res);
}

/**
 * Ping the backend health endpoint.
 */
export async function checkHealth(): Promise<HealthCheck> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse<HealthCheck>(res);
}
