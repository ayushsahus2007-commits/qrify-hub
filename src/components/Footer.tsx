import { QrCode } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
            <QrCode className="h-3 w-3 text-primary-foreground" />
          </div>
          QRify
        </div>
        <p>Fast, clean QR codes — no app needed.</p>
        <p>&copy; {new Date().getFullYear()} QRify</p>
      </div>
    </footer>
  );
}
