import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QRPreviewProps {
  data: string;
  color: string;
  bgColor: string;
  size: number;
  onDataUrl?: (url: string) => void;
}

export default function QRPreview({ data, color, bgColor, size, onDataUrl }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    if (!data.trim()) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    QRCode.toCanvas(canvas, data, {
      width: size,
      margin: 2,
      color: { dark: color, light: bgColor },
    }).then(() => {
      onDataUrl?.(canvas.toDataURL("image/png"));
    }).catch(() => setEmpty(true));
  }, [data, color, bgColor, size, onDataUrl]);

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-border bg-card p-6"
      style={{ minHeight: size + 48, minWidth: size + 48 }}
    >
      {empty ? (
        <p className="text-muted-foreground text-sm text-center">Enter data to preview QR code</p>
      ) : (
        <canvas ref={canvasRef} className="rounded" />
      )}
    </div>
  );
}
