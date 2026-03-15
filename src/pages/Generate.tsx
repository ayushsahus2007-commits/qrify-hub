import { useState, useCallback } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import QRPreview from "@/components/QRPreview";
import { addToHistory } from "@/lib/qr-history";
import { toast } from "sonner";

const QR_TYPES = ["URL", "Text", "Email", "Phone", "WiFi"] as const;
type QRType = (typeof QR_TYPES)[number];

function buildQRData(type: QRType, fields: Record<string, string>): string {
  switch (type) {
    case "URL": return fields.url || "";
    case "Text": return fields.text || "";
    case "Email": return fields.email ? `mailto:${fields.email}?subject=${encodeURIComponent(fields.subject || "")}&body=${encodeURIComponent(fields.body || "")}` : "";
    case "Phone": return fields.phone ? `tel:${fields.phone}` : "";
    case "WiFi": return fields.ssid ? `WIFI:T:${fields.encryption || "WPA"};S:${fields.ssid};P:${fields.password || ""};;` : "";
    default: return "";
  }
}

export default function Generate() {
  const [type, setType] = useState<QRType>("URL");
  const [fields, setFields] = useState<Record<string, string>>({ url: "" });
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [size, setSize] = useState(256);
  const [dataUrl, setDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const setField = (key: string, val: string) => setFields((f) => ({ ...f, [key]: val }));
  const qrData = buildQRData(type, fields);

  const handleDataUrl = useCallback((url: string) => setDataUrl(url), []);

  const handleTypeChange = (t: string) => {
    setType(t as QRType);
    setFields({});
  };

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qrify-${type.toLowerCase()}-${Date.now()}.png`;
    a.click();
    addToHistory({ type, content: qrData, color, backgroundColor: bgColor, size, dataUrl });
    toast.success("QR code downloaded and saved to history");
  };

  const handleCopy = async () => {
    if (!dataUrl) return;
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("QR code copied to clipboard");
    } catch {
      toast.error("Failed to copy image");
    }
  };

  return (
    <div className="container py-8 md:py-12">
      <h1 className="text-2xl font-bold text-foreground mb-6">Generate QR Code</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: inputs */}
        <div className="flex flex-col gap-6">
          <Tabs value={type} onValueChange={handleTypeChange}>
            <TabsList className="w-full flex-wrap h-auto gap-1 bg-secondary p-1 rounded-xl">
              {QR_TYPES.map((t) => (
                <TabsTrigger key={t} value={t} className="flex-1 min-w-[60px] rounded-lg data-[state=active]:bg-card">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            {type === "URL" && (
              <div className="flex flex-col gap-2">
                <Label>URL</Label>
                <Input placeholder="https://example.com" value={fields.url || ""} onChange={(e) => setField("url", e.target.value)} className="bg-background border-border" />
              </div>
            )}
            {type === "Text" && (
              <div className="flex flex-col gap-2">
                <Label>Text</Label>
                <Input placeholder="Enter any text" value={fields.text || ""} onChange={(e) => setField("text", e.target.value)} className="bg-background border-border" />
              </div>
            )}
            {type === "Email" && (
              <>
                <div className="flex flex-col gap-2"><Label>Email</Label><Input placeholder="hello@example.com" value={fields.email || ""} onChange={(e) => setField("email", e.target.value)} className="bg-background border-border" /></div>
                <div className="flex flex-col gap-2"><Label>Subject</Label><Input placeholder="Subject" value={fields.subject || ""} onChange={(e) => setField("subject", e.target.value)} className="bg-background border-border" /></div>
                <div className="flex flex-col gap-2"><Label>Body</Label><Input placeholder="Message body" value={fields.body || ""} onChange={(e) => setField("body", e.target.value)} className="bg-background border-border" /></div>
              </>
            )}
            {type === "Phone" && (
              <div className="flex flex-col gap-2">
                <Label>Phone Number</Label>
                <Input placeholder="+1234567890" value={fields.phone || ""} onChange={(e) => setField("phone", e.target.value)} className="bg-background border-border" />
              </div>
            )}
            {type === "WiFi" && (
              <>
                <div className="flex flex-col gap-2"><Label>Network Name (SSID)</Label><Input placeholder="MyWiFi" value={fields.ssid || ""} onChange={(e) => setField("ssid", e.target.value)} className="bg-background border-border" /></div>
                <div className="flex flex-col gap-2"><Label>Password</Label><Input type="password" placeholder="Password" value={fields.password || ""} onChange={(e) => setField("password", e.target.value)} className="bg-background border-border" /></div>
                <div className="flex flex-col gap-2">
                  <Label>Encryption</Label>
                  <select className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground" value={fields.encryption || "WPA"} onChange={(e) => setField("encryption", e.target.value)}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Customization */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-sm text-foreground">Customize</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>QR Color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-9 rounded-lg border border-border cursor-pointer bg-transparent" />
                  <span className="text-xs text-muted-foreground font-mono">{color}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Background</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 rounded-lg border border-border cursor-pointer bg-transparent" />
                  <span className="text-xs text-muted-foreground font-mono">{bgColor}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Size: {size}px</Label>
              <Slider min={128} max={512} step={32} value={[size]} onValueChange={([v]) => setSize(v)} />
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <QRPreview data={qrData} color={color} bgColor={bgColor} size={size} onDataUrl={handleDataUrl} />
          <div className="flex gap-2">
            <Button className="flex-1 gap-2" onClick={handleDownload} disabled={!qrData.trim()}>
              <Download className="h-4 w-4" /> Download PNG
            </Button>
            <Button variant="pill" className="gap-2" onClick={handleCopy} disabled={!qrData.trim()}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
