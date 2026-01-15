
"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Send, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function StaffLeavePage() {
  const [loading, setLoading] = useState(false);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
      type: "Annual",
      startDate: "",
      endDate: "",
      reason: ""
  });

  const fetchMyLeaves = async () => {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;

     const { data } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
     if (data) setMyLeaves(data);
  };

  useEffect(() => {
      fetchMyLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          alert("You must be logged in.");
          setLoading(false);
          return;
      }
      
      const { error } = await supabase.from('leave_requests').insert({
          user_id: user.id,
          type: formData.type,
          start_date: formData.startDate,
          end_date: formData.endDate,
          reason: formData.reason,
          status: 'Pending'
      });

      if (error) {
          alert("Error: " + error.message);
      } else {
          setFormData({ type: "Annual", startDate: "", endDate: "", reason: "" });
          fetchMyLeaves();
          alert("Leave request submitted successfully!");
      }
      setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leave Requests</h1>
          <p className="text-muted-foreground">Submit and track your time-off applications.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Request Form */}
           <Card className="border-primary/10 shadow-lg">
               <CardHeader>
                   <CardTitle>New Request</CardTitle>
                   <CardDescription>Fill in the details below.</CardDescription>
               </CardHeader>
               <CardContent>
                   <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="space-y-2">
                           <Label>Leave Type</Label>
                           <select 
                               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                               value={formData.type}
                               onChange={(e) => setFormData({...formData, type: e.target.value})}
                           >
                               <option value="Annual">Annual Leave</option>
                               <option value="Sick">Sick Leave</option>
                               <option value="Casual">Casual Leave</option>
                               <option value="Emergency">Emergency</option>
                           </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                               <Label>Start Date</Label>
                               <Input type="date" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                           </div>
                           <div className="space-y-2">
                               <Label>End Date</Label>
                               <Input type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                           </div>
                       </div>
                       <div className="space-y-2">
                           <Label>Reason</Label>
                           <Input placeholder="Brief reason..." required value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} />
                       </div>
                       <Button type="submit" className="w-full" disabled={loading}>
                           {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                           Submit Application
                       </Button>
                   </form>
               </CardContent>
           </Card>

           {/* History List */}
           <div className="space-y-4">
               <h3 className="text-lg font-semibold">Request History</h3>
               {myLeaves.length === 0 ? (
                   <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                       No requests found.
                   </div>
               ) : (
                   myLeaves.map(leave => (
                       <Card key={leave.id} className="overflow-hidden">
                           <div className={`h-1.5 w-full ${
                               leave.status === 'Approved' ? 'bg-green-500' : 
                               leave.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                           }`} />
                           <CardContent className="p-4">
                               <div className="flex justify-between items-start mb-2">
                                   <div>
                                       <div className="font-semibold">{leave.type} Leave</div>
                                       <div className="text-xs text-muted-foreground flex items-center gap-1">
                                           <Calendar className="h-3 w-3" /> {leave.start_date} - {leave.end_date}
                                       </div>
                                   </div>
                                   <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                                       leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                       leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                   }`}>
                                       {leave.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                                       {leave.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                                       {leave.status === 'Pending' && <Clock className="h-3 w-3" />}
                                       {leave.status}
                                   </div>
                               </div>
                               <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                   "{leave.reason}"
                               </p>
                           </CardContent>
                       </Card>
                   ))
               )}
           </div>
       </div>
    </div>
  );
}
