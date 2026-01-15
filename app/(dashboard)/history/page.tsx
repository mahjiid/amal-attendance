"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Search, Filter, Clock, MapPin, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";

// Interface matching the Supabase join result
interface AttendanceLog {
  id: string; // UUID
  user_id: string;
  clock_in: string; // ISO timestamp
  clock_out: string | null;
  status: string;
  location_lat: number | null;
  location_lng: number | null;
  method: string;
  employees: {
      full_name: string;
      role: string;
      department: string;
  };
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          employees (
            full_name,
            role,
            department
          )
        `)
        .order('clock_in', { ascending: false });

      if (error) {
        console.error("Error fetching logs:", error);
      } else {
        setLogs(data as any[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
     log.employees?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.employees?.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = ["Employee", "Role", "Department", "Date", "Clock In", "Status", "Location"];
    const rows = filteredLogs.map(log => [
        `"${log.employees?.full_name || 'Unknown'}"`,
        log.employees?.role || "Staff",
        log.employees?.department || "General",
        new Date(log.clock_in).toLocaleDateString(),
        new Date(log.clock_in).toLocaleTimeString(),
        log.status,
        log.location_lat ? `${log.location_lat.toFixed(4)},${log.location_lng?.toFixed(4)}` : "Unknown"
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Global Staff Logs</h1>
          <p className="text-muted-foreground">Master record of all factory and office attendance.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="gap-2 bg-background hover:bg-muted" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export All CSV
           </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-card/50 p-4 rounded-lg border border-border/50">
          <div className="relative flex-1">
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Search by Name or Role..." 
                className="pl-9 bg-background/50 border-white/10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <Button variant="ghost" size="icon">
             <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
      </div>

      <Card className="border-primary/10 shadow-lg relative overflow-hidden bg-white/60 backdrop-blur-xl">
        <CardHeader>
           <div className="flex items-center justify-between">
              <CardTitle>Recent Scans</CardTitle>
              <div className="text-xs text-muted-foreground font-mono">
                 LIVE DATA FEED
              </div>
           </div>
        </CardHeader>
        <CardContent>
           <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                      <tr>
                          <th className="px-6 py-3 rounded-l-lg">Employee</th>
                          <th className="px-6 py-3">Department</th>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Clock In</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3 rounded-r-lg">Location</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                      {loading ? (
                          Array.from({ length: 5 }).map((_, i) => (
                             <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-10 w-32 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-24 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-20 bg-muted rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-6 w-20 bg-muted rounded-full"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-32 bg-muted rounded"></div></td>
                             </tr>
                          ))
                      ) : filteredLogs.length === 0 ? (
                          <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                  No logs found.
                              </td>
                          </tr>
                      ) : (
                          filteredLogs.map((log) => (
                              <tr key={log.id} className="hover:bg-muted/30 transition-colors group">
                                  <td className="px-6 py-4 font-medium">
                                     <div className="flex items-center gap-3">
                                         <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                             {log.employees?.full_name?.[0] || '?'}
                                         </div>
                                         <div>
                                             <div className="text-foreground">{log.employees?.full_name || 'Unknown'}</div>
                                             <div className="text-xs text-muted-foreground">{log.employees?.role || 'Staff'}</div>
                                         </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground">{log.employees?.department || 'General'}</td>
                                  <td className="px-6 py-4 text-muted-foreground">
                                     {new Date(log.clock_in).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 font-mono text-xs text-green-700 font-medium">
                                      {new Date(log.clock_in).toLocaleTimeString()}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          log.status === 'On Time' 
                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                                      }`}>
                                          {log.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground text-xs flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> 
                                      {log.location_lat ? `${log.location_lat.toFixed(4).slice(0,6)}...` : 'Unknown'}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
