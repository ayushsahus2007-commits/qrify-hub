import { useEffect, useRef, useState } from "react";

interface QRPreviewProps {
  data: string;
  color: string;
  bgColor: string;
  size: number;
  dataUrl: string; // Add dataUrl prop
}

export default function QRPreview({ data, color, bgColor, size, dataUrl }: QRPreviewProps) {
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    if (!data.trim()) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
  }, [data]);

  return (
    <div
      className="flex items-center justify-center rounded-xl border border-border bg-card p-6"
      style={{ minHeight: size + 48, minWidth: size + 48 }}
    >
      {empty ? (
        <p className="text-muted-foreground text-sm text-center">Enter data to preview QR code</p>
      ) : (
        dataUrl ? ( // Use dataUrl directly
          <img src={dataUrl} alt="QR Code" className="rounded" />
        ) : (
          <p className="text-muted-foreground text-sm text-center">Generating QR Code...</p>
        )
      )}
    </div>
  );
}
