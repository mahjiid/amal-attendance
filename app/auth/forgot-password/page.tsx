"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmalTechLogo } from "@/components/ui/logo";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background/90 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <AmalTechLogo className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold tracking-tight">Password Reset</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        <Card className="border-primary/20 shadow-2xl backdrop-blur-xl bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Forgot Password
            </CardTitle>
            <CardDescription>
              {!sent
                ? "We'll send you a secure link to reset your password"
                : "Check your email for the reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!sent ? (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@amaltech.com.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="border-primary/30"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Link href="/auth/login">
                  <Button variant="ghost" className="w-full" type="button">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-700 font-medium">✓ Email Sent!</p>
                  <p className="text-sm text-green-600 mt-2">
                    Check your inbox for password reset instructions
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
