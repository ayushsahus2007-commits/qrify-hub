import { QrCode } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card py-8 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-secondary">
          <QrCode className="h-4 w-4 text-primary" />
          QRify
        </div>
        <p>Fast, clean QR codes — no app needed.</p>
        <p>&copy; {new Date().getFullYear()} QRify</p>
      </div>
    </footer>
  );
}
