
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, Mail, User, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function SignupPage() {
  const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign up auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm`,
            data: {
                full_name: formData.fullName,
            }
        }
      });

      if (authError) throw authError;

      // 2. Create public profile (if trigger doesn't exist)
      // Note: We'll do a safe insert. If you have a Trigger set up in Supabase, this might be redundant 
      // but safe to do explicit insert for this demo if not using Triggers.
      if (authData.user) {
          const { error: profileError } = await supabase.from('employees').insert({
              id: authData.user.id,
              email: formData.email,
              full_name: formData.fullName,
              role: 'Staff', // Default everyone to Staff
              department: 'Factory', // Default
              status: 'Active'
          });
          
          if (profileError) {
              // If error is duplicate key, it means Trigger handled it. Ignore.
              if (!profileError.message.includes('duplicate key')) {
                  console.error("Profile creation failed:", profileError);
              }
          }
      }

      alert("Account created! Please log in.");
      router.push("/auth/login");

    } catch (err: any) {
      setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
       <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl">
         <CardHeader className="space-y-1 text-center">
           <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
           <CardDescription>
             Join the Amal Tech team.
           </CardDescription>
         </CardHeader>
         <CardContent>
           <form onSubmit={handleSignup} className="space-y-4">
             {error && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                </div>
             )}
             
             <div className="space-y-2">
               <Label htmlFor="name">Full Name</Label>
               <div className="relative">
                 <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input 
                   id="name" 
                   validation-name="Full Name"
                   placeholder="John Doe"
                   className="pl-9 bg-background/50"
                   value={formData.fullName}
                   onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                   required
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
               <div className="relative">
                 <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input 
                   id="email" 
                   type="email" 
                   placeholder="name@amaltech.com"
                   className="pl-9 bg-background/50"
                   value={formData.email}
                   onChange={(e) => setFormData({...formData, email: e.target.value})}
                   required
                 />
               </div>
             </div>

             <div className="space-y-2">
               <Label htmlFor="password">Password</Label>
               <div className="relative">
                 <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input 
                   id="password" 
                   type="password" 
                   placeholder="••••••••"
                   className="pl-9 bg-background/50"
                   value={formData.password}
                   onChange={(e) => setFormData({...formData, password: e.target.value})}
                   required
                   minLength={6}
                 />
               </div>
             </div>
             
             <Button type="submit" className="w-full" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
               Create Account
             </Button>
           </form>
         </CardContent>
         <CardFooter className="flex justify-center text-sm text-muted-foreground">
            Already have an account? 
            <Link href="/auth/login" className="ml-1 text-primary hover:underline">
               Log in
            </Link>
         </CardFooter>
       </Card>
    </div>
  );
}
