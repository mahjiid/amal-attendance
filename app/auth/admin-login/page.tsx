"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmalTechLogo } from "@/components/ui/logo";
import { Loader2, KeyRound, Siren, ShieldAlert, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        router.push("/admin");
    }, 1500);
  };

  return (
    <div className="relative">
      {/* Decorative Warning Elements */}
      <div className="absolute -top-12 left-0 right-0 flex justify-center text-destructive animate-pulse">
         <Siren className="h-8 w-8" />
      </div>

      <Card className="glass border-destructive/30 shadow-[0_0_50px_rgba(239,68,68,0.2)] backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
               {/* Tinted Logo */}
               <div className="relative grayscale brightness-150 contrast-125">
                   <AmalTechLogo className="h-10 w-auto opacity-80" />
                   <div className="absolute inset-0 bg-destructive mix-blend-overlay opacity-50" />
               </div>
          </div>
          <CardTitle className="text-2xl font-bold text-destructive font-mono tracking-tighter">ROOT_ACCESS</CardTitle>
          <CardDescription className="text-red-200/60">Restricted to IT Support & Superadmins.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-id" className="text-destructive/80">Admin Identifier</Label>
              <div className="relative">
                  <ShieldAlert className="absolute left-3 top-3 h-4 w-4 text-destructive/50" />
                  <Input id="admin-id" placeholder="sys_admin_01" className="pl-9 bg-black/40 border-destructive/20 text-destructive placeholder:text-destructive/30 focus-visible:ring-destructive" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="token" className="text-destructive/80">Security Token</Label>
              <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-destructive/50" />
                  <Input id="token" type="password" placeholder="••••••••" className="pl-9 bg-black/40 border-destructive/20 text-destructive focus-visible:ring-destructive" required />
              </div>
            </div>
            <Button type="submit" variant="destructive" className="w-full gap-2 relative overflow-hidden group h-11" disabled={isLoading}>
              {isLoading ? (
                  <>
                     <Loader2 className="h-4 w-4 animate-spin" /> Verifying Credentials...
                  </>
              ) : (
                  <>
                     <ShieldAlert className="h-4 w-4" /> Grant Access
                  </>
              )}
            </Button>
            
            <div className="text-center mt-4">
              <Link href="/auth/login" className="text-xs text-muted-foreground hover:text-white flex items-center justify-center gap-1 transition-colors group">
                 <ChevronLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
                 Return to Staff Login
              </Link>
           </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Footer warning */}
      <div className="text-center text-[10px] text-destructive/50 font-mono mt-4">
         UNAUTHORIZED ACCESS ATTEMPTS WILL BE LOGGED <br/> AND REPORTED TO SECURITY.
      </div>
    </div>
  );
}
