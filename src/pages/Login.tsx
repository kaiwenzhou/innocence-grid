import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useVolunteer } from "@/context/VolunteerContext";
import { VolunteerService } from "@/services/volunteers";
import { Scale } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentVolunteer } = useVolunteer();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const volunteer = await VolunteerService.getVolunteerByEmail(email.toLowerCase().trim());

      if (!volunteer) {
        toast({
          title: "Login failed",
          description: "Email not found. Please check your email or contact an administrator.",
          variant: "destructive",
        });
        return;
      }

      setCurrentVolunteer(volunteer);
      toast({
        title: `Welcome back, ${volunteer.full_name}!`,
        description: "You've successfully logged in",
      });

      navigate("/clients");
    } catch (error) {
      toast({
        title: "Login error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick login buttons for demo
  const quickLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setIsLoading(true);

    try {
      const volunteer = await VolunteerService.getVolunteerByEmail(demoEmail);
      if (volunteer) {
        setCurrentVolunteer(volunteer);
        toast({
          title: `Welcome, ${volunteer.full_name}!`,
          description: "Successfully logged in",
        });
        navigate("/clients");
      } else {
        toast({
          title: "Login failed",
          description: "Volunteer account not found. Did you run the SQL migration?",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Database Error",
        description: error instanceof Error ? error.message : "Could not connect to database. Make sure you ran database-volunteers-setup.sql in Supabase!",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">JusticeMAP</h1>
          </div>
          <p className="text-muted-foreground text-center">
            Volunteer Portal for Parole Transcript Analysis
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@justicemap.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Quick Login (Demo):
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin("jordan.rivers@justicemap.org")}
              disabled={isLoading}
            >
              Jordan R.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin("alex.chen@justicemap.org")}
              disabled={isLoading}
            >
              Alex C.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin("taylor.brooks@justicemap.org")}
              disabled={isLoading}
            >
              Taylor B.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin("sam.martinez@justicemap.org")}
              disabled={isLoading}
            >
              Sam M.
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => quickLogin("morgan.davis@justicemap.org")}
              disabled={isLoading}
              className="col-span-2"
            >
              Morgan D.
            </Button>
          </div>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          JusticeMAP • Transforming parole transcripts into actionable justice
        </p>
      </Card>
    </div>
  );
};

export default Login;

