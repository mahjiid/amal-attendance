"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AmalTechLogo } from "@/components/ui/logo";
import { motion } from "framer-motion";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const error = searchParams.get('error');

  useEffect(() => {
    if (!error) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [router, error]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md w-full border-red-200 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <AmalTechLogo className="h-10 w-auto" />
              </div>
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Verification Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                We couldn't verify your email. The link may have expired or already been used.
              </p>
              <div className="pt-4 space-y-3">
                <Link href="/auth/login">
                  <Button className="w-full" variant="outline">
                    Go to Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="w-full">
                    Sign Up Again
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full border-green-200 shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <AmalTechLogo className="h-10 w-auto" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Email Verified! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                Your account has been successfully verified!
              </p>
              <p className="text-sm text-muted-foreground">
                You're all set to access the Amal Attendance System.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm font-medium">
                  Redirecting to dashboard in {countdown} seconds...
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link href="/dashboard">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Go to Dashboard Now
                </Button>
              </Link>
            </div>

            <div className="text-xs text-muted-foreground">
              <Link href="/auth/login" className="hover:text-primary underline">
                Or click here to login manually
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
