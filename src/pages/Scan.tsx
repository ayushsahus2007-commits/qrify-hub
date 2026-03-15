import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Copy, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Scan() {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isUrl = result ? /^https?:\/\//i.test(result) : false;

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const startCamera = useCallback(async () => {
    await stopScanner();
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-scanner-container");
    scannerRef.current = scanner;
    setScanning(true);
    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 15, qrbox: { width: 250, height: 250 } },
        (text) => {
          setResult(text);
          stopScanner();
          toast.success("QR code detected!");
        },
        () => {}
      );
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
      setScanning(false);
    }
  }, [stopScanner]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await stopScanner();
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("qr-scanner-container");
    scannerRef.current = scanner;
    try {
      const res = await scanner.scanFile(file, true);
      setResult(res);
      toast.success("QR code detected!");
    } catch {
      toast.error("No QR code found in the image.");
    }
    try { scanner.clear(); } catch {}
    scannerRef.current = null;
    if (fileRef.current) fileRef.current.value = "";
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, [stopScanner]);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container py-8 md:py-12 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Scan QR Code</h1>

      <div className="flex gap-2 mb-6">
        <Button variant={mode === "camera" ? "default" : "pill"} className="flex-1 gap-2" onClick={() => { setMode("camera"); setResult(null); }}>
          <Camera className="h-4 w-4" /> Camera
        </Button>
        <Button variant={mode === "upload" ? "default" : "pill"} className="flex-1 gap-2" onClick={() => { setMode("upload"); stopScanner(); setResult(null); }}>
          <Upload className="h-4 w-4" /> Upload Image
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden mb-6 relative" style={{ minHeight: 300 }}>
        <div id="qr-scanner-container" ref={containerRef} className="w-full" />
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-2 border-primary/50 rounded-lg">
              <div className="scanner-line absolute left-0 right-0 h-0.5 bg-primary" />
            </div>
          </div>
        )}
        {mode === "camera" && !scanning && !result && (
          <div className="flex items-center justify-center h-[300px]">
            <Button onClick={startCamera} className="gap-2"><Camera className="h-4 w-4" /> Start Camera</Button>
          </div>
        )}
        {mode === "upload" && !result && (
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <Button onClick={() => fileRef.current?.click()} className="gap-2"><Upload className="h-4 w-4" /> Select Image</Button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <p className="text-xs text-muted-foreground mt-3">PNG, JPG, or any image with a QR code</p>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">Decoded Result</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setResult(null)}><X className="h-4 w-4" /></Button>
          </div>
          <p className="text-sm text-foreground break-all font-mono bg-background rounded-lg p-3">{result}</p>
          <div className="flex gap-2">
            <Button variant="pill" size="sm" className="gap-2" onClick={handleCopy}><Copy className="h-3 w-3" /> Copy</Button>
            {isUrl && (
              <a href={result} target="_blank" rel="noopener noreferrer">
                <Button variant="pill" size="sm" className="gap-2"><ExternalLink className="h-3 w-3" /> Open Link</Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
