import { Link, useLocation } from "react-router-dom";
import { QrCode, ScanLine, History, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/generate", label: "Generate", icon: QrCode },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
];

export default function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
          <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
            <QrCode className="h-4 w-4 text-primary-foreground" />
          </div>
          QRify
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background p-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === item.to ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
