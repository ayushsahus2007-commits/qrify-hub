import { Link, useLocation, useNavigate } from "react-router-dom";
import { QrCode, ScanLine, History, Menu, X, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const navItems = [
  { to: "/generate", label: "Generate", icon: QrCode },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/history", label: "History", icon: History },
];

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [session, setSession] = useState<any>(null); // State to hold user session

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed out successfully!");
      navigate("/auth"); // Redirect to auth page after sign out
    }
  };

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
          {session ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {session.user?.email ? session.user.email[0].toUpperCase() : "?"}
                </div>
                <span>{session.user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-2 text-sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button
                variant={location.pathname === "/auth" ? "secondary" : "ghost"}
                size="sm"
                className="gap-2 text-sm"
              >
                Sign In
              </Button>
            </Link>
          )}
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
          {session ? (
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button
                variant={location.pathname === "/auth" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
