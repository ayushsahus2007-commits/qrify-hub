import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useSession } from "@/components/SessionProvider";
import { Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const navigate = useNavigate();
  const { session } = useSession();
  const RATE_LIMIT_MESSAGE = "Too many attempts right now. Please wait a minute and try again.";

  const clearCredentials = () => {
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const handleModeSwitch = () => {
    setIsSignUp((prev) => !prev);
    setShowConfirmationMessage(false);
    setAuthMessage("");
    clearCredentials();
  };

  useEffect(() => {
    if (session) {
      navigate("/"); // Redirect to home if already logged in
    }
  }, [session, navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthMessage("");
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          const errorStatus = (error as { status?: number }).status;
          if (errorStatus === 429 || error.message.toLowerCase().includes("rate")) {
            setAuthMessage(RATE_LIMIT_MESSAGE);
            toast.error(RATE_LIMIT_MESSAGE);
            return;
          }
          if (error.message.toLowerCase().includes("already")) {
            setAuthMessage("This email is already registered. Please sign in.");
            toast.error("This email is already registered. Please sign in.");
            setIsSignUp(false);
            clearCredentials();
          } else {
            throw error;
          }
        } else {
          const isAlreadyRegistered = (data.user?.identities?.length ?? 0) === 0;
          if (isAlreadyRegistered) {
            setAuthMessage("This email is already registered. Please sign in.");
            toast.error("This email is already registered. Please sign in.");
            setIsSignUp(false);
            clearCredentials();
          } else {
            toast.success("Confirmation email sent! Please check your email and then sign in.");
            setIsSignUp(false);
            setShowConfirmationMessage(true);
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const errorStatus = (error as { status?: number }).status;
          if (errorStatus === 429 || error.message.toLowerCase().includes("rate")) {
            setAuthMessage(RATE_LIMIT_MESSAGE);
            toast.error(RATE_LIMIT_MESSAGE);
            return;
          }
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            setAuthMessage("Email does not exist. Please sign up first.");
            toast.error("Email does not exist. Please sign up first.");
            clearCredentials();
          } else {
            throw error;
          }
          return;
        }
        toast.success("Sign-in successful!");
        navigate("/"); // Redirect to home after successful sign-in
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setAuthMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmationMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Confirm Your Email</CardTitle>
            <CardDescription>
              A confirmation email has been sent to <strong>{email}</strong>.
              Please check your inbox and click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => { setShowConfirmationMessage(false); clearCredentials(); }} className="w-full">
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Sign Up" : "Sign In"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Create your account to get started." : "Sign in to your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </Button>
            {authMessage ? (
              <div className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                {authMessage}
              </div>
            ) : null}
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button variant="link" onClick={handleModeSwitch} className="p-0 h-auto">
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
