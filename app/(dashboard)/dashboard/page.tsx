"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Clock, AlertCircle, CheckCircle2, Activity, Server, Smartphone } from "lucide-react";
import { AnalyticsDashboard } from "@/components/ui/analytics";
import { PCBCircuit, CodeStream } from "@/components/ui/tech-visuals";

import { isWithinGeofence } from "@/lib/geolocation";
import { Button } from "@/components/ui/button";

import { createClient } from "@/utils/supabase/client";

export default function Dashboard() {
  const [time, setTime] = useState(new Date());
  const [geoLoading, setGeoLoading] = useState(false);
  const [stats, setStats] = useState({
      total: 0,
      present: 0,
      late: 0,
      absent: 0
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const fetchStats = async () => {
          const today = new Date().toISOString().split('T')[0];
          
          // 1. Total Employees
          const { count: totalEmployees } = await supabase
              .from('employees')
              .select('*', { count: 'exact', head: true });
          
          // 2. Today's Logs
          const { data: logs, error } = await supabase
              .from('attendance_logs')
              .select(`
                *,
                employees ( full_name, role )
              `)
              .gte('clock_in', `${today}T00:00:00`)
              .lte('clock_in', `${today}T23:59:59`)
              .order('clock_in', { ascending: false });

          if (logs) {
              const present = logs.length;
              const late = logs.filter(l => l.status === 'Late').length;
              
              setStats({
                  total: totalEmployees || 0,
                  present: present,
                  late: late,
                  absent: (totalEmployees || 0) - present
              });
              
              setRecentLogs(logs.slice(0, 5));
          }
      };

      fetchStats();
      
      // Optional: Realtime subscription could go here
      const channel = supabase
        .channel('dashboard_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs' }, () => {
            fetchStats();
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); }
  }, []);

  const handleWebClockIn = () => {
    setGeoLoading(true);
    if (!navigator.geolocation) {
       alert("Geolocation is not supported by your browser");
       setGeoLoading(false);
       return;
    }

    navigator.geolocation.getCurrentPosition(
       async (position) => {
           const { latitude, longitude } = position.coords;
           const withinRange = isWithinGeofence(latitude, longitude);
           
           if (!withinRange) {
             alert(`❌ Access Denied!\nYou are not at the office.\nYour Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
             setGeoLoading(false);
             return;
           }

           // Get current user
           const { data: { user } } = await supabase.auth.getUser();
           if (!user) {
             alert("Error: You must be logged in.");
             setGeoLoading(false);
             return;
           }

           // Check logs
           const today = new Date().toISOString().split('T')[0];
           const { data: existingLogs } = await supabase
              .from('attendance_logs')
              .select('*')
              .eq('user_id', user.id)
              .gte('clock_in', `${today}T00:00:00`)
              .lte('clock_in', `${today}T23:59:59`);
           
           if (existingLogs && existingLogs.length > 0) {
              alert("⚠️ You have already clocked in today!");
              setGeoLoading(false);
              return;
           }

           // Insert Log
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
               alert(`✅ Success! You are clocked in.\nTime: ${now.toLocaleTimeString()}`);
               // Force stats refresh if needed, but subscription handles it
           }
           setGeoLoading(false);
       },
       (error) => {
           alert("Error getting location: " + error.message);
           setGeoLoading(false);
       }
    );
  };

  return (
    <div className="space-y-6 relative isolate">
       {/* Tech Background Layer */}
       <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <PCBCircuit className="absolute top-0 right-0 w-full h-full text-primary/5 opacity-50" />
       </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight glow-text text-foreground">IT Command Center</h1>
          <p className="text-muted-foreground">Real-time overview of factory operations & attendance.</p>
        </div>
        <div className="flex items-center gap-4">
            <Button 
               variant={geoLoading ? "outline" : "default"} 
               onClick={handleWebClockIn}
               disabled={geoLoading}
               className="gap-2 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
               {geoLoading ? (
                   <Activity className="h-4 w-4 animate-spin" /> 
               ) : (
                   <Smartphone className="h-4 w-4" /> 
               )}
               {geoLoading ? "Locating..." : "Web Check-In"}
            </Button>
            
            <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm shadow-sm">
               <Activity className="h-4 w-4 text-green-500 animate-pulse" />
               <span className="text-sm font-medium text-green-600">System Normal</span>
               <span className="text-xs text-muted-foreground ml-2">| {time.toLocaleTimeString()}</span>
            </div>
        </div>
      </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Registered in database</p>
             </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-all">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                <p className="text-xs text-muted-foreground">Clocked in so far</p>
             </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-all">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
                <p className="text-xs text-muted-foreground">Arrived after 8:15 AM</p>
             </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-all">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent / Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
             </CardHeader>
             <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                <p className="text-xs text-muted-foreground">Not yet clocked in</p>
             </CardContent>
          </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area */}
          <div className="lg:col-span-2">
             <AnalyticsDashboard />
          </div>

          {/* Live Feed / System Status */}
          <div className="space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle className="text-lg">Live Kiosk Feed</CardTitle>
                   <CardDescription>Recent activity at Terminal 01</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                      {recentLogs.length > 0 ? recentLogs.map((log) => (
                         <div key={log.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                               <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                  {log.employees?.full_name?.charAt(0) || "U"}
                               </div>
                               <div>
                                  <p className="text-sm font-medium">{log.employees?.full_name || "Unknown User"}</p>
                                  <p className="text-xs text-muted-foreground">Clock In • {log.employees?.role || "Staff"}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xs font-mono text-foreground">
                                   {new Date(log.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                               <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                   log.status === 'On Time' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                               }`}>
                                   {log.status}
                               </span>
                            </div>
                         </div>
                      )) : (
                          <div className="text-center text-muted-foreground text-sm py-8">
                              No activity recorded yet today.
                          </div>
                      )}
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-black text-white border-white/10 overflow-hidden relative">
                <CodeStream className="absolute inset-0 opacity-20" />
                <CardHeader>
                   <CardTitle className="text-white flex items-center gap-2">
                       <Server className="h-4 w-4" /> System Health
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-gray-400">Kiosk Connectivity</span>
                       <span className="text-green-400 font-mono">ONLINE</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-green-500 w-full animate-pulse"></div>
                    </div>

                    <div className="flex justify-between items-center text-sm mt-4">
                       <span className="text-gray-400">Database Sync</span>
                       <span className="text-green-400 font-mono">OPTIMAL</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm mt-4">
                       <span className="text-gray-400">Active Terminals</span>
                       <span className="text-white font-mono">1</span>
                    </div>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}
