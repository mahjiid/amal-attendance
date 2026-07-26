"use client";
import React, { useState, useEffect, useRef } from "react";
import { AmalTechLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, User, AlertCircle, ScanLine, Camera } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { createClient } from "@/utils/supabase/client";
import { FaceVerification } from "@/components/face-verification";

// ─── Configurable time thresholds ────────────────────────────────────────────
/** Staff is marked "Late" if clock-in is after this time */
const LATE_THRESHOLD_HOUR   = 8;   // 8 AM
const LATE_THRESHOLD_MINUTE = 15;  // 8:15 AM
/** Earliest allowed clock-out hour (24-hr) */
const EARLIEST_CLOCK_OUT_HOUR = 17; // 5:00 PM
// ─────────────────────────────────────────────────────────────────────────────

export default function KioskPage() {
  const [mode, setMode] = useState<"in" | "out">("in");
  const [employeeId, setEmployeeId] = useState("");
  const [step, setStep] = useState<"idle" | "verifying_user" | "face_verification" | "processing" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [scannedUser, setScannedUser] = useState<Record<string, unknown> | null>(null);
  const [attendanceLogId, setAttendanceLogId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Auto-focus input for barcode scanners
  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
       if (step === 'idle') inputRef.current?.focus();
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    // Check Clock Out Restriction immediately
    if (mode === "out") {
        const now = new Date();
        const hours = now.getHours();
        
        if (hours < EARLIEST_CLOCK_OUT_HOUR) {
            setStep("error");
            setFeedbackMessage(`Too Early: Clock-out is not permitted before ${EARLIEST_CLOCK_OUT_HOUR}:00.`);
            setTimeout(() => {
                setStep("idle");
                setEmployeeId("");
            }, 3000);
            return;
        }
    }

    setStep("verifying_user");
    
    // Lookup User by Email
    const { data: user, error: userError } = await supabase
        .from('employees')
        .select('*')
        .ilike('email', employeeId)
        .single();
    
    if (!user) {
        setStep("error");
        setFeedbackMessage("User Not Found. Enter Valid Email.");
        setTimeout(() => {
            setStep("idle");
            setEmployeeId("");
        }, 3000);
        return;
    }

    setScannedUser(user);

    // Check for duplicate check-in
    if (mode === "in") {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const { data: existing } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', user.id)
            .gte('clock_in', `${today}T00:00:00`)
            .single();

        if (existing) {
            setStep("error");
            setFeedbackMessage("Already Clocked In Today!");
            setTimeout(() => {
                setStep("idle");
                setEmployeeId("");
                setScannedUser(null);
            }, 3000);
            return;
        }
    }

    // Move to face verification step
    setStep("face_verification");
  };

  const handleFaceVerified = async (verified: boolean, confidence: number) => {
    if (!verified) {
        setStep("error");
        setFeedbackMessage(`Face Verification Failed (${confidence}% confidence). Access Denied.`);
        setTimeout(() => {
            setStep("idle");
            setEmployeeId("");
            setScannedUser(null);
        }, 4000);
        return;
    }

    // Face verified! Proceed with check-in
    setStep("processing");

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate =
      hours > LATE_THRESHOLD_HOUR ||
      (hours === LATE_THRESHOLD_HOUR && minutes > LATE_THRESHOLD_MINUTE);
    const today = now.toISOString().split('T')[0];

    if (mode === "in") {
        // Insert attendance log
        const { data: logData, error: logError } = await supabase
            .from('attendance_logs')
            .insert({
                employee_id: scannedUser.id,
                employee_name: scannedUser.name,
                clock_in: now.toISOString(),
                date: today,
                status: isLate ? 'Late' : 'On Time',
                location: 'Kiosk Terminal 01',
                method: 'Kiosk'
            })
            .select()
            .single();

        if (logError) {
            setStep("error");
            setFeedbackMessage("System Error: " + logError.message);
        } else {
            setAttendanceLogId(logData?.id || null);
            setStep("success");
            setFeedbackMessage(
                isLate 
                    ? `Welcome, ${scannedUser.name}! Note: You are LATE.` 
                    : `Welcome, ${scannedUser.name}! You are On Time. ✓ Face Verified (${confidence}%)`
            );
        }
    } else {
        // Clock out
        setStep("success");
        setFeedbackMessage(`Goodbye, ${scannedUser.name}! Clock Out Recorded. ✓ Face Verified (${confidence}%)`);
    }

    // Reset after 4 seconds
    setTimeout(() => {
        setStep("idle");
        setEmployeeId("");
        setScannedUser(null);
        setAttendanceLogId(null);
    }, 4000);
  };

  const handleFaceVerificationCancel = () => {
    setStep("idle");
    setEmployeeId("");
    setScannedUser(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <AnimatedBackground />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <AmalTechLogo className="h-16 w-auto" />
        </motion.div>

        {/* Kiosk Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full backdrop-blur-sm">
            <ScanLine className="h-6 w-6 text-orange-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-orange-100 tracking-wide">
              FACTORY KIOSK :: TERMINAL 01
            </h1>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Email Entry */}
          {step === "idle" && (
            <motion.div
              key="email-entry"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 p-8">
                {/* Mode Selection */}
                <div className="flex gap-4 mb-8">
                  <Button
                    onClick={() => setMode("in")}
                    variant={mode === "in" ? "default" : "outline"}
                    className="flex-1 h-16 text-lg"
                  >
                    Clock In
                  </Button>
                  <Button
                    onClick={() => setMode("out")}
                    variant={mode === "out" ? "default" : "outline"}
                    className="flex-1 h-16 text-lg"
                  >
                    Clock Out
                  </Button>
                </div>

                {/* Email Input */}
                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Enter Your Email
                    </label>
                    <Input
                      ref={inputRef}
                      type="email"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="your.email@amaltech.com"
                      className="h-14 text-lg bg-slate-900/50 border-slate-600"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  >
                    <User className="mr-2 h-5 w-5" />
                    Authorize Access
                  </Button>
                </form>

                <p className="text-center text-sm text-slate-400 mt-6">
                  <Camera className="inline h-4 w-4 mr-1" />
                  Face verification required after email entry
                </p>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Verifying User */}
          {step === "verifying_user" && (
            <motion.div
              key="verifying-user"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 p-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 animate-spin text-orange-400 mb-4" />
                  <p className="text-lg text-slate-300">Verifying User...</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Face Verification */}
          {step === "face_verification" && scannedUser && (
            <motion.div
              key="face-verification"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl"
            >
              <div className="mb-4 text-center">
                <p className="text-lg text-slate-300">
                  Welcome, <span className="font-bold text-orange-400">{scannedUser.name}</span>
                </p>
                <p className="text-sm text-slate-400">Please verify your identity</p>
              </div>
              
              <FaceVerification
                employeeId={scannedUser.id}
                employeeEmail={scannedUser.email}
                attendanceLogId={attendanceLogId}
                onVerified={handleFaceVerified}
                onCancel={handleFaceVerificationCancel}
              />
            </motion.div>
          )}

          {/* Step 4: Processing */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md"
            >
              <Card className="bg-slate-800/50 backdrop-blur-md border-slate-700/50 p-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-16 w-16 animate-spin text-orange-400 mb-4" />
                  <p className="text-lg text-slate-300">Logging Attendance...</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Success/Error States */}
          {(step === "success" || step === "error") && (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-2xl"
            >
              <Card className={`p-8 ${
                step === "success" 
                  ? "bg-green-900/20 border-green-500/50" 
                  : "bg-red-900/20 border-red-500/50"
              } backdrop-blur-md`}>
                <div className="text-center mb-6">
                  {step === "success" ? (
                    <CheckCircle2 className="h-24 w-24 text-green-400 mx-auto mb-4" />
                  ) : (
                    <AlertCircle className="h-24 w-24 text-red-400 mx-auto mb-4" />
                  )}
                  <h2 className={`text-3xl font-bold mb-2 ${
                    step === "success" ? "text-green-300" : "text-red-300"
                  }`}>
                    {step === "success" ? "ACCESS GRANTED" : "ACCESS DENIED"}
                  </h2>
                  <p className="text-lg text-slate-300">{feedbackMessage}</p>
                </div>

                {scannedUser && step === "success" && (
                  <div className="bg-background/80 backdrop-blur border border-white/10 p-6 rounded-xl">
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-md bg-muted overflow-hidden border-2 border-white/20">
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                          {scannedUser?.name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">{scannedUser?.name}</div>
                        <div className="text-sm font-mono text-muted-foreground uppercase">{scannedUser?.role}</div>
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-mono">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          {feedbackMessage}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
