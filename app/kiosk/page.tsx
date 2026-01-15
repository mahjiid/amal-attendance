"use client";
import React, { useState, useEffect, useRef } from "react";
import { AmalTechLogo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, User, AlertCircle, ScanLine } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { createClient } from "@/utils/supabase/client";

export default function KioskPage() {
  const [mode, setMode] = useState<"in" | "out">("in");
  const [employeeId, setEmployeeId] = useState(""); // Will treat as Email for now
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [scannedUser, setScannedUser] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Auto-focus input for barcode scanners
  useEffect(() => {
    inputRef.current?.focus();
    const interval = setInterval(() => {
       if (status === 'idle') inputRef.current?.focus();
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const handleClock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;

    // Check Clock Out Restriction immediately
    if (mode === "out") {
        const now = new Date();
        const hours = now.getHours();
        
        // Strict 5 PM Rule (17:00)
        if (hours < 17) {
            setStatus("error");
            setFeedbackMessage("Too Early: Closing time is 5:00 PM.");
            setTimeout(() => {
                setStatus("idle");
                setEmployeeId("");
            }, 3000);
            return;
        }
    }

    setStatus("verifying");
    
    // 1. Lookup User by Email
    // In a real Kiosk, this would be a Badge UUID or formatted ID. 
    // For demo, we assume they type their email.
    const { data: user, error: userError } = await supabase
        .from('employees')
        .select('*')
        .ilike('email', employeeId) // Case insensitive match
        .single();
    
    if (user) {
        setScannedUser(user);
        
        if (mode === "in") {
             // Check time for lateness
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const isLate = (hours > 8) || (hours === 8 && minutes > 15);
            
            // Check for duplicates
            const today = now.toISOString().split('T')[0];
            const { data: existing } = await supabase
                .from('attendance_logs')
                .select('*')
                .eq('user_id', user.id)
                .gte('clock_in', `${today}T00:00:00`)
                .single();

            if (existing) {
                 setStatus("error");
                 setFeedbackMessage("Already Clocked In Today!");
            } else {
                 // Insert Log
                 const { error: logError } = await supabase.from('attendance_logs').insert({
                     user_id: user.id,
                     clock_in: now.toISOString(),
                     status: isLate ? 'Late' : 'On Time',
                     location_lat: 0, // Kiosk is fixed
                     location_lng: 0,
                     method: 'Kiosk'
                 });

                 if (logError) {
                     setStatus("error");
                     setFeedbackMessage("System Error: " + logError.message);
                 } else {
                     setStatus("success");
                     setFeedbackMessage(isLate ? `Welcome, ${user.full_name}! Note: You are LATE.` : `Welcome, ${user.full_name}! You are On Time.`);
                 }
            }

        } else {
            // Clock Out Logic
            // In real app, we update the existing record.
            const now = new Date();
            setStatus("success");
            setFeedbackMessage(`Goodbye, ${user.full_name}! Clock Out Recorded.`);
            // TODO: Update clock_out column in DB if strictly tracking pairs
        }
        
        // Reset after 3 seconds
        setTimeout(() => {
            setStatus("idle");
            setEmployeeId("");
            setScannedUser(null);
        }, 3000);

    } else {
        setStatus("error");
        setFeedbackMessage("User Not Found. Enter Valid Email.");
         // Reset after 2 seconds
         setTimeout(() => {
            setStatus("idle");
            setEmployeeId("");
        }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
       {/* ... (Background) ... */}
       <AnimatedBackground />
       <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/50 pointer-events-none" />

       <div className="relative z-10 w-full max-w-md px-4">
          <div className="mb-8 text-center flex flex-col items-center">
             <AmalTechLogo className="h-12 w-auto mb-4" />
             <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider border border-primary/20">
                FACTORY KIOSK :: TERMINAL 01
             </div>
          </div>

          <AnimatePresence mode="wait">
             {status === "idle" && (
                <motion.div
                   key="idle"
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -20 }}
                >
                   <Card className="p-8 border-primary/20 bg-white/80 backdrop-blur-xl shadow-2xl">
                      <div className="flex bg-muted/50 p-1 rounded-lg mb-6 backdrop-blur-sm border border-white/10">
                          <button 
                             onClick={() => setMode("in")}
                             className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-md transition-all uppercase relative overflow-hidden ${
                                 mode === 'in' 
                                 ? 'bg-primary text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' 
                                 : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                             }`}
                          >
                             Clock In
                             {mode === 'in' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                          </button>
                          <button 
                             onClick={() => setMode("out")}
                             className={`flex-1 py-3 text-sm font-bold tracking-wider rounded-md transition-all uppercase relative overflow-hidden ${
                                 mode === 'out' 
                                 ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)]' 
                                 : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                             }`}
                          >
                             Clock Out
                             {mode === 'out' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />}
                          </button>
                      </div>

                      <form onSubmit={handleClock} className="space-y-8">
                          <div className="text-center space-y-4">
                              <div className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto border-2 mb-4 relative ${
                                  mode === 'in' ? 'border-primary bg-primary/10' : 'border-orange-500 bg-orange-500/10'
                              }`}>
                                 {/* Holographic Ring */}
                                 <div className={`absolute inset-0 rounded-full border-2 border-dashed animate-[spin_10s_linear_infinite] opacity-50 ${
                                     mode === 'in' ? 'border-primary' : 'border-orange-500'
                                 }`} />
                                 <User className={`h-10 w-10 ${mode === 'in' ? 'text-primary' : 'text-orange-500'}`} />
                              </div>
                              
                              <div>
                                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                                    {mode === 'in' ? 'STAFF CHECK-IN' : 'STAFF CHECK-OUT'}
                                </h2>
                                <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest mt-1">
                                    {mode === 'in' ? 'Secure Entry Terminal' : 'End of Shift Protocol'}
                                </p>
                              </div>
                          </div>

                          <div className="relative group">
                             {/* Scanner Beam Animation */}
                             <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg z-20">
                                <div className="w-full h-[2px] bg-primary/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] absolute top-0 animate-[scan_2s_linear_infinite]" />
                             </div>
                             
                             <Input 
                                ref={inputRef}
                                value={employeeId} 
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="ENTER EMAIL ID" 
                                className="h-16 text-center text-xl font-mono border-primary/30 bg-background/50 focus:border-primary focus:ring-primary/30 transition-all placeholder:text-sm placeholder:tracking-normal placeholder:opacity-50"
                                autoComplete="off"
                             />
                          </div>

                          <Button 
                             type="submit" 
                             size="lg" 
                             className={`w-full h-16 text-lg font-bold uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                 mode === 'in' 
                                 ? 'bg-gradient-to-r from-primary to-blue-600 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]' 
                                 : 'bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.4)]'
                             }`}
                          >
                             {mode === 'in' ? 'Authorize Access' : 'Confirm Departure'}
                          </Button>
                      </form>
                   </Card>
                   
                   <p className="text-center mt-8 text-xs font-mono text-muted-foreground/60 tracking-[0.2em] animate-pulse">
                      SECURE TERMINAL • CONNECTION ESTABLISHED
                   </p>
                </motion.div>
             )}

             {status === "verifying" && (
                  <motion.div
                     key="verifying"
                     initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
                     animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                     className="flex flex-col items-center justify-center space-y-8"
                  >
                     <div className="relative">
                        {/* Multiple spinning rings for tech feel */}
                        <div className="h-40 w-40 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
                        <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-[spin_2s_linear_infinite_reverse]" />
                        <div className="absolute inset-4 rounded-full border-t-4 border-primary animate-spin" />
                        
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Loader2 className="h-12 w-12 text-primary animate-spin" />
                        </div>
                     </div>
                     <div className="text-center space-y-2">
                        <h3 className="text-2xl font-bold text-primary animate-pulse tracking-widest">VERIFYING ID</h3>
                        <p className="font-mono text-sm text-muted-foreground">Accessing Employee Database...</p>
                     </div>
                  </motion.div>
             )}

             {status === "success" && (
                  <motion.div
                     key="success"
                     initial={{ scale: 0.8, opacity: 0, rotateX: 90 }}
                     animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     transition={{ type: "spring", bounce: 0.5 }}
                     className="w-full"
                  >
                      <Card className={`p-8 border-2 shadow-2xl text-center relative overflow-hidden backdrop-blur-xl ${
                          feedbackMessage.includes("LATE") 
                             ? "border-amber-500 bg-amber-500/5 shadow-[0_0_100px_rgba(245,158,11,0.3)]" 
                             : "border-green-500 bg-green-500/5 shadow-[0_0_100px_rgba(34,197,94,0.3)]"
                      }`}>
                         {/* Success Burst Animation */}
                         <div className={`absolute inset-0 opacity-20 animate-pulse ${
                             feedbackMessage.includes("LATE") ? "bg-amber-500" : "bg-green-500"
                         }`} />
                         
                         <div className="relative z-10">
                             <div className={`mx-auto h-28 w-28 rounded-full flex items-center justify-center mb-6 border-4 ${
                                  feedbackMessage.includes("LATE") ? "bg-amber-100 border-amber-500" : "bg-green-100 border-green-500"
                             }`}>
                                {feedbackMessage.includes("LATE") ? (
                                    <AlertCircle className="h-14 w-14 text-amber-600" />
                                ) : (
                                    <CheckCircle2 className="h-14 w-14 text-green-600" />
                                )}
                             </div>
                             
                             <h2 className={`text-4xl font-black uppercase mb-2 tracking-wide ${
                                  feedbackMessage.includes("LATE") ? "text-amber-600" : "text-green-600"
                             }`}>
                                 {feedbackMessage.includes("LATE") ? "WARNING" : "AUTHORIZED"}
                             </h2>
                             
                             <div className="bg-background/80 backdrop-blur border border-white/10 p-6 rounded-xl mt-6 transform transition-all hover:scale-105">
                                  <div className="flex items-center gap-6 text-left">
                                      <div className="h-20 w-20 rounded-md bg-muted overflow-hidden border-2 border-white/20 shadow-inner">
                                         {/* Simulated Avatar */}
                                         <div className="w-full h-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                            {scannedUser?.full_name.charAt(0)}
                                         </div>
                                      </div>
                                      <div>
                                          <div className="text-2xl font-bold text-foreground">{scannedUser?.full_name}</div>
                                          <div className="text-sm font-mono text-muted-foreground uppercase">{scannedUser?.role}</div>
                                          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-mono">
                                             <div className={`w-2 h-2 rounded-full ${feedbackMessage.includes("LATE") ? "bg-amber-500" : "bg-green-500"} animate-pulse`} />
                                             {feedbackMessage}
                                          </div>
                                      </div>
                                  </div>
                             </div>

                             <div className="mt-8 font-mono text-xs text-muted-foreground opacity-60">
                                ACCESS LOGGED: {new Date().toLocaleTimeString()}
                             </div>
                         </div>
                      </Card>
                  </motion.div>
             )}

             {status === "error" && (
                  <motion.div
                     key="error"
                     initial={{ x: 20, opacity: 0 }}
                     animate={{ x: 0, opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="w-full"
                  >
                     <Card className="p-8 border-red-500 bg-red-500/5 shadow-[0_0_100px_rgba(239,68,68,0.3)] text-center relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                        <div className="relative z-10">
                            <div className="mx-auto h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mb-6 border-4 border-red-500">
                                <AlertCircle className="h-12 w-12 text-red-600" />
                            </div>
                            <h2 className="text-3xl font-black text-red-600 mb-2 uppercase tracking-widest">ACCESS DENIED</h2>
                            <p className="text-xl text-foreground font-medium">{feedbackMessage}</p>
                        </div>
                     </Card>
                  </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}
