"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmalTechLogo } from "@/components/ui/logo";
import { Loader2, Fingerprint, Lock, ShieldCheck, Cpu, Scan } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle } from "lucide-react";

export default function StaffLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement).value;

    try {
        console.log("Auth: Attempting login for", email);
        const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (authError) {
            console.error("Auth: Login failed", authError);
            setError(authError.message || "Login failed. Please check your credentials.");
            setIsLoading(false);
            return;
        }
        
        // Fetch user role
        if (user && user.email) {
            console.log("Auth: Success, fetching role for", user.email);
            const { data: emp, error: empError } = await supabase
                .from('employees')
                .select('role')
                .eq('email', user.email)
                .single();
            
            if (empError) {
                console.warn("Auth: Role fetch error", empError);
            }

            // Redirect based on role
            const role = emp?.role || 'Staff';
            const adminRoles = ['Admin', 'Superadmin', 'Administration'];
            
            if (adminRoles.includes(role)) {
                console.log("Auth: Admin role detected, redirecting to admin dashboard");
                window.location.href = "/dashboard";
            } else {
                console.log("Auth: Staff role detected, redirecting to staff dashboard");
                window.location.href = "/staff/dashboard";
            }
        }
    } catch (err: any) {
        console.error("Auth: Exception caught", err);
        setError(err.message || "Login failed. Please check your credentials and try again.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* Animated Corner Borders */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary via-blue-500 to-primary opacity-30 group-hover:opacity-70 blur transition duration-500 animate-pulse-slow"></div>
        
        {/* Tech Card */}
        <Card className="glass border-primary/20 shadow-[0_20px_60px_rgba(0,0,0,0.1)] backdrop-blur-2xl relative overflow-hidden bg-white/60">
           {/* Scanner Line Effect */}
           <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-scanner-line opacity-50 pointer-events-none" />
           <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl animate-pulse pointer-events-none" />

          <CardHeader className="text-center pb-2 relative z-10">
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
                    <AmalTechLogo className="h-12 w-auto relative z-10" />
                </div>
            </div>
            <CardTitle className="text-2xl font-bold glow-text tracking-wider uppercase font-mono text-primary">System Access</CardTitle>
            <CardDescription className="text-xs font-mono text-primary/80">
                SECURE::AUTH_V4.2 // STAFF_NODE
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 group/input">
                <Label htmlFor="email" className="text-xs font-mono uppercase text-muted-foreground group-hover/input:text-primary transition-colors">&gt;&gt; User_Identity</Label>
                <div className="relative">
                    <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input 
                        id="email" 
                        placeholder="ID / USERNAME" 
                        className="pl-9 bg-white/50 border-input shadow-sm focus:border-primary/50 font-mono text-sm placeholder:text-muted-foreground/50 h-10 transition-all duration-300 focus:bg-primary/5 focus:ring-1 focus:ring-primary/20" 
                        required 
                    />
                    {/* Corner accents for input */}
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <div className="space-y-2 group/input">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-mono uppercase text-muted-foreground group-hover/input:text-primary transition-colors">&gt;&gt; Security_Code</Label>
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="pl-9 bg-white/50 border-input shadow-sm focus:border-primary/50 font-mono text-sm placeholder:text-muted-foreground/50 h-10 transition-all duration-300 focus:bg-primary/5 focus:ring-1 focus:ring-primary/20" 
                        required 
                    />
                     {/* Corner accents for input */}
                     <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                     <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 opacity-0 group-focus-within/input:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="pt-2">
                  <Button type="submit" className="w-full gap-2 relative overflow-hidden group h-12 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300" disabled={isLoading}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {isLoading ? (
                        <>
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> 
                        <span className="font-mono text-xs">PROCESSING...</span>
                        </>
                    ) : (
                        <>
                        <ShieldCheck className="h-4 w-4 text-primary" /> 
                        <span className="font-mono tracking-widest text-xs">INITIATE_SESSION</span>
                        <Cpu className="h-3 w-3 text-primary/50 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </>
                    )}
                  </Button>
              </div>
              
              {/* Error Message Display */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Login Failed</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                    {error.includes('Email not confirmed') && (
                      <p className="text-xs text-red-600 mt-2">
                        Please check your email for the confirmation link, or contact admin to confirm your account.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
               <div className="text-center space-y-2 mt-6">
                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest pt-2">
                      Amal Technologies Secure Gateway
                  </p>
                  <div className="flex justify-center gap-2 text-[10px] text-primary/40 font-mono">
                      <span>STATUS: ONLINE</span>
                      <span>|</span>
                  </div>
               </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground pt-0 pb-6 relative z-10">
            <div className="text-xs">
                Don't have an account?
                <Link href="/auth/signup" className="ml-1 text-primary hover:underline font-medium">
                    Sign up
                </Link>
            </div>
            <div className="text-xs">
                Forgot your password?
                <Link href="/auth/forgot-password" className="ml-1 text-primary hover:underline font-medium">
                    Reset it here
                </Link>
            </div>
            <Link href="/" className="hover:text-primary transition-colors">
               ← Back to Home
            </Link>
         </CardFooter>
       </Card>
    </motion.div>
  );
}
