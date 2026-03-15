import { useState, useEffect } from "react";
import { Download, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getHistory, deleteFromHistory, clearHistory, QRHistoryItem } from "@/lib/qr-history";
import { toast } from "sonner";

export default function HistoryPage() {
  const [items, setItems] = useState<QRHistoryItem[]>([]);

  useEffect(() => { setItems(getHistory()); }, []);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    setItems(getHistory());
    toast.success("Deleted");
  };

  const handleClear = () => {
    clearHistory();
    setItems([]);
    toast.success("History cleared");
  };

  const handleDownload = (item: QRHistoryItem) => {
    const a = document.createElement("a");
    a.href = item.dataUrl;
    a.download = `qrify-${item.type.toLowerCase()}-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-secondary">History</h1>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClear} className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="h-3 w-3" /> Clear All
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Clock className="h-10 w-10" />
          <p className="text-sm">No QR codes generated yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <img src={item.dataUrl} alt="QR" className="w-16 h-16 rounded border border-border flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-primary uppercase">{item.type}</span>
                  <p className="text-sm text-foreground truncate">{item.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => handleDownload(item)}>
                  <Download className="h-3 w-3" /> Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
