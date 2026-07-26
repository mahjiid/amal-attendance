"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, History, MapPin, Activity } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { isWithinGeofence } from "@/lib/geolocation";
import { useToast, ToastContainer } from "@/components/ui/toast";

// ─── Configurable late-arrival threshold ─────────────────────────────────────
const LATE_THRESHOLD_HOUR   = 8;
const LATE_THRESHOLD_MINUTE = 15;
const EARLIEST_CLOCK_OUT_HOUR = 17;
// ─────────────────────────────────────────────────────────────────────────────

interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: any;
}

interface AttendanceLog {
  id: string;
  clock_in: string;
  clock_out: string | null;
  status: string;
  location_lat: number | null;
}

export default function StaffDashboard() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [todayLog, setTodayLog] = useState<AttendanceLog | null>(null);
  const supabase = createClient();
  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // middleware handles redirect
      setUser(user);

      // Fetch today's log
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('clock_in', `${today}T00:00:00`)
        .lte('clock_in', `${today}T23:59:59`)
        .maybeSingle();

      if (data) setTodayLog(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleWebClockIn = () => {
    setClockInLoading(true);

    if (!navigator.geolocation) {
      toast("error", "Not Supported", "Geolocation is not supported by your browser.");
      setClockInLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const withinRange = isWithinGeofence(latitude, longitude);

        if (!withinRange) {
          toast("error", "Access Denied — Off-site", "You are outside the permitted office radius (1,000 m).");
          setClockInLoading(false);
          return;
        }

        if (!user) return;

        const today = new Date().toISOString().split('T')[0];
        const { data: existingLogs } = await supabase
          .from('attendance_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('clock_in', `${today}T00:00:00`)
          .lte('clock_in', `${today}T23:59:59`);

        if (existingLogs && existingLogs.length > 0) {
          toast("warning", "Already Clocked In", "You have already clocked in today.");
          setClockInLoading(false);
          return;
        }

        const now = new Date();
        const isLate =
          now.getHours() > LATE_THRESHOLD_HOUR ||
          (now.getHours() === LATE_THRESHOLD_HOUR && now.getMinutes() > LATE_THRESHOLD_MINUTE);

        // --- Self healing: Ensure employee record exists before logging attendance ---
        const { data: empCheck } = await supabase.from('employees').select('id').eq('id', user.id).maybeSingle();
        if (!empCheck) {
            await supabase.from('employees').insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
                role: 'Staff',
                department: 'General',
                status: 'Active'
            });
        }
        // ----------------------------------------------------------------------------

        const { data: newLog, error } = await supabase
          .from('attendance_logs')
          .insert({
            user_id: user.id,
            clock_in: now.toISOString(),
            status: isLate ? 'Late' : 'On Time',
            location_lat: latitude,
            location_lng: longitude,
            method: 'Web',
          })
          .select()
          .single();

        if (error) {
          toast("error", "Clock-in Failed", error.message);
        } else {
          toast(
            "success",
            isLate ? "Clocked In — Late" : "Clocked In — On Time",
            `Recorded at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          );
          setTodayLog(newLog);
        }
        setClockInLoading(false);
      },
      (err) => {
        toast("error", "Location Error", err.message);
        setClockInLoading(false);
      }
    );
  };

  const handleWebClockOut = async () => {
    setClockInLoading(true);

    if (!user || !todayLog) {
       setClockInLoading(false);
       return;
    }

    const now = new Date();
    const hours = now.getHours();

    if (hours < EARLIEST_CLOCK_OUT_HOUR) {
       toast("error", "Too Early", `Clock-out is not permitted before ${EARLIEST_CLOCK_OUT_HOUR}:00.`);
       setClockInLoading(false);
       return;
    }

    const { data: updatedLog, error } = await supabase
       .from('attendance_logs')
       .update({ clock_out: now.toISOString() })
       .eq('id', todayLog.id)
       .select()
       .single();

    if (error) {
       toast("error", "Clock-out Failed", error.message);
    } else {
       toast("success", "Clocked Out", `Shift ended at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
       setTodayLog(updatedLog);
    }
    setClockInLoading(false);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Portal</h1>
          <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{user?.email}</span></p>
        </div>
        <Link href="/staff/leave">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" /> Request Leave
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clock In Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Quick Action
            </CardTitle>
            <CardDescription>Record your daily attendance via GPS verification.</CardDescription>
          </CardHeader>
          <CardContent>
            {todayLog ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium text-sm mb-4">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {todayLog.clock_out ? 'Shift Completed' : 'Currently Clocked In'}
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  Clock In: {new Date(todayLog.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — <span className={todayLog.status === 'On Time' ? 'text-green-600' : 'text-amber-600'}>{todayLog.status}</span>
                </p>
                {!todayLog.clock_out && (
                  <Button 
                     size="lg" 
                     variant="outline" 
                     className="w-full h-16 text-lg gap-2 text-primary border-primary hover:bg-primary/5" 
                     onClick={handleWebClockOut} 
                     disabled={clockInLoading}
                  >
                     {clockInLoading ? (
                        <><Activity className="h-5 w-5 animate-spin" /> Processing...</>
                     ) : (
                        <><MapPin className="h-5 w-5" /> Clock Out</>
                     )}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full h-20 text-lg gap-2"
                  onClick={handleWebClockIn}
                  disabled={clockInLoading}
                >
                  {clockInLoading ? (
                    <><Activity className="h-5 w-5 animate-spin" /> Verifying Location...</>
                  ) : (
                    <><MapPin className="h-5 w-5" /> Clock In Now</>
                  )}
                </Button>
                <p className="text-xs text-center mt-2 text-muted-foreground">
                  GPS verification required • 1,000 m radius
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Today&apos;s Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium">Clock In</span>
              <span className={`font-mono text-sm ${todayLog ? 'text-green-600' : 'text-muted-foreground'}`}>
                {todayLog ? new Date(todayLog.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium">Clock Out</span>
              <span className="font-mono text-sm text-muted-foreground">
                {todayLog?.clock_out ? new Date(todayLog.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium">Status</span>
              <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${
                !todayLog ? 'bg-gray-100 text-gray-600' :
                todayLog.status === 'On Time' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {todayLog ? todayLog.status : 'Not yet clocked in'}
              </span>
            </div>
            <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
              <span className="text-sm font-medium">Location</span>
              <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {todayLog?.location_lat ? 'Office (Verified)' : 'Not recorded'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
