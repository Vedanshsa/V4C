import { useEffect, useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getDocumentScans, getCurrentUser } from "@/lib/authService";
import type { Database } from "@/lib/database.types";

type DocumentScan = Database["public"]["Tables"]["document_scans"]["Row"];

const History = () => {
  const [scans, setScans] = useState<DocumentScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const data = await getDocumentScans(user.id);
          setScans(data);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-display font-bold mb-6">Document History</h1>
          <p className="text-muted-foreground mb-8">
            View past legal documents analyzed by Voice-4-Compliance.
          </p>

          <div className="glass rounded-xl border border-border/60 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Document Name</th>
                  <th className="px-6 py-4">Date Scanned</th>
                  <th className="px-6 py-4">Legal Status</th>
                  <th className="px-6 py-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Loading history...
                    </td>
                  </tr>
                ) : scans.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No documents analyzed yet.
                    </td>
                  </tr>
                ) : (
                  scans.map((item) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-brand-purple/10 text-brand-purple rounded-lg shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[200px] block" title={item.filename}>
                          {item.filename}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.is_legal ? (
                          <span className="inline-flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-full text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            Legally Sound
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            Risks found
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-brand-teal hover:underline text-xs font-medium focus:outline-none">
                          View details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
