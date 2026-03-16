import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, Upload, Copy, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ImageUploadDragDrop } from "@/components/ui/image-upload-drag-drop";

export default function Scan() {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);

  const isUrl = result ? /^https?:\/\//i.test(result) : false;

  const handleImageSelect = useCallback((file: File | null) => {
    setUploadedImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const webhookUrl = "https://ayush1501.app.n8n.cloud/webhook/QRscan";
          const formData = new FormData();
          formData.append('image_input', file); // Append the file with the field name 'image_input'

          setProcessing(true); // Start processing

          const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData, // Send FormData object
            // fetch will automatically set 'Content-Type: multipart/form-data' with the correct boundary
          });

          if (response.ok) {
            const htmlResponse = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlResponse, 'text/html');
            const preElement = doc.querySelector('td > pre');

            if (preElement && preElement.textContent) {
              setResult(preElement.textContent.trim());
              toast.success("Image sent to webhook and QR code decoded!");
            } else {
              toast.error("Webhook response did not contain expected QR code data.");
            }
          } else {
            const errorText = await response.text();
            toast.error(`Webhook error: ${response.status} - ${errorText}`);
          }
        } catch (error) {
          console.error("Error sending image to webhook:", error);
          toast.error("Failed to send image to webhook.");
        } finally {
          setProcessing(false); // End processing
        }
      };
      reader.readAsArrayBuffer(file); // Read as ArrayBuffer for binary sending
    } else {
      setResult(null);
    }
  }, []);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      try { scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const captureFrame = useCallback(async () => {
    if (scannerRef.current && canvasRef.current) {
      const videoElement = document.querySelector('#qr-scanner-container video') as HTMLVideoElement;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (videoElement && context) {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `camera-capture-${Date.now()}.png`, { type: 'image/png' });
            await handleImageSelect(file);
            stopScanner(); // Stop camera after capturing and sending
          }
        }, 'image/png');
      }
    }
  }, [handleImageSelect]);

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
        () => {}, // Success callback is not used directly here
        () => {}
      );
    } catch {
      toast.error("Could not access camera. Please allow camera permissions.");
      setScanning(false);
    }
  }, [stopScanner]);

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
        {mode === "camera" && (
          <div className="relative w-full h-full">
            <div id="qr-scanner-container" className="w-full h-full" />
            {scanning && (
              <Button onClick={captureFrame} className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-2">
                <Camera className="h-4 w-4" /> Capture
              </Button>
            )}
            {!scanning && !result && !processing && (
              <div className="flex items-center justify-center h-[300px]">
                <Button onClick={startCamera} className="gap-2"><Camera className="h-4 w-4" /> Start Camera</Button>
              </div>
            )}
            {processing && (
              <div className="flex items-center justify-center h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
        {mode === "upload" && !result && !processing && (
          <div className="flex items-center justify-center h-[300px]">
            <ImageUploadDragDrop onImageSelect={handleImageSelect} />
          </div>
        )}
        {mode === "upload" && processing && (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
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
