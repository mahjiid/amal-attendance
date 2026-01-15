
"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, History, MapPin, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isWithinGeofence } from "@/lib/geolocation";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) {
          router.push("/auth/login");
          return;
       }
       setUser(user);
       setLoading(false);
    };
    getUser();
  }, []);

  const handleWebClockIn = () => {
    setClockInLoading(true);
    if (!navigator.geolocation) {
       alert("Geolocation is not supported.");
       setClockInLoading(false);
       return;
    }

    navigator.geolocation.getCurrentPosition(
       async (position) => {
           const { latitude, longitude } = position.coords;
           const withinRange = isWithinGeofence(latitude, longitude);
           
           if (!withinRange) {
               alert(`❌ Access Denied!\nYou are outside the office.\nAllowed: 1000m`);
               setClockInLoading(false);
               return;
           }

           // Check if already clocked in today
           if (!user) return;
           const today = new Date().toISOString().split('T')[0];
           
           // Fetch today's log
           const { data: existingLogs } = await supabase
              .from('attendance_logs')
              .select('*')
              .eq('user_id', user.id)
              .gte('clock_in', `${today}T00:00:00`)
              .lte('clock_in', `${today}T23:59:59`);
           
           if (existingLogs && existingLogs.length > 0) {
               alert("⚠️ You have already clocked in today!");
               setClockInLoading(false);
               return;
           }

           // Insert new log
           // Calculate status (Late after 8:15 AM)
           const now = new Date();
           const isLate = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() > 15);
           
           const { error } = await supabase
               .from('attendance_logs')
               .insert({
                   user_id: user.id,
                   clock_in: now.toISOString(),
                   status: isLate ? 'Late' : 'On Time',
                   location_lat: latitude,
                   location_lng: longitude,
                   method: 'Web'
               });
           
           if (error) {
               alert("Error clocking in: " + error.message);
           } else {
               alert(`✅ Clock In Successful!\nTime: ${now.toLocaleTimeString()}\nStatus: ${isLate ? 'Late' : 'On Time'}`);
               // Refresh/Redirect?
               window.location.reload(); 
           }
           setClockInLoading(false);
       },
       (error) => {
           alert("Location Error: " + error.message);
           setClockInLoading(false);
       }
    );
  };

  if (loading) return <div className="p-8 text-center">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Staff Portal</h1>
            <p className="text-muted-foreground">Welcome back, {user?.email}</p>
         </div>
         <div className="flex gap-2">
            <Link href="/staff/leave">
                <Button variant="outline" className="gap-2">
                   <Calendar className="h-4 w-4" /> Request Leave
                </Button>
            </Link>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Clock In Card */}
         <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Quick Action
               </CardTitle>
               <CardDescription>Record your daily attendance.</CardDescription>
            </CardHeader>
            <CardContent>
               <Button size="lg" className="w-full h-24 text-lg gap-2" onClick={handleWebClockIn} disabled={clockInLoading}>
                  {clockInLoading ? "Verifying Location..." : "📍 Clock In Now"}
               </Button>
               <p className="text-xs text-center mt-2 text-muted-foreground">
                   * GPS verification required (1000m radius)
               </p>
            </CardContent>
         </Card>

         {/* Status Card */}
         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" /> Today's Status
               </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Clock In</span>
                  <span className="font-mono text-green-600">08:00 AM</span>
               </div>
               <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Clock Out</span>
                  <span className="font-mono text-muted-foreground">--:--</span>
               </div>
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                  <span className="text-sm font-medium">Location</span>
                  <span className="font-mono text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Office (Verified)
                  </span>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
