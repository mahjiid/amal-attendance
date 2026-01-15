"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Plus, Check, X, FileText, User, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";

interface LeaveRequest {
  id: string; // UUID
  user_id: string;
  employees?: { full_name: string }; // Joined
  type: "Sick" | "Annual" | "Casual" | "Emergency";
  start_date: string;
  end_date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface Employee {
  id: string;
  full_name: string;
}

export default function LeaveRequestsPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  
  const [newLeave, setNewLeave] = useState({
     userId: "",
     type: "Sick",
     startDate: "",
     endDate: "",
     reason: ""
  });

  const fetchData = async () => {
    setLoading(true);
    // Fetch employees for dropdown
    const { data: empData } = await supabase.from('employees').select('id, full_name').order('full_name');
    if (empData) setEmployees(empData);

    // Fetch leaves with Join
    const { data: leaveData } = await supabase
        .from('leave_requests')
        .select(`
            *,
            employees ( full_name )
        `)
        .order('created_at', { ascending: false });
    
    if (leaveData) setLeaves(leaveData as any); 
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.userId) return;

    const { data, error } = await supabase.from('leave_requests').insert({
        user_id: newLeave.userId,
        // No employee_name needed, verified by Join
        type: newLeave.type,
        start_date: newLeave.startDate,
        end_date: newLeave.endDate,
        reason: newLeave.reason,
        status: "Pending"
    }).select();

    if (error) {
        alert("Error creating leave request: " + error.message);
    } else {
        // Refresh to get the join
        fetchData();
        setShowForm(false);
        setNewLeave({ userId: "", type: "Sick", startDate: "", endDate: "", reason: "" });
    }
  };

  const updateStatus = async (id: string, status: "Approved" | "Rejected") => {
      // Optimistic update
      setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));

      const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id);

      if (error) {
          alert("Error updating status: " + error.message);
          fetchData(); // Revert on error
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leave Management</h1>
          <p className="text-muted-foreground">Manage staff time-off requests and sickness logs.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className={cn("gap-2", showForm ? "bg-muted text-foreground hover:bg-muted/80" : "bg-primary text-white")}>
           {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
           {showForm ? "Cancel" : "Log New Leave"}
        </Button>
      </div>

      {showForm && (
          <Card className="border-primary/20 bg-primary/5 animate-accordion-down overflow-hidden">
             <CardHeader>
                <CardTitle>Log Staff Leave</CardTitle>
                <CardDescription>Enter details for the employee's absence.</CardDescription>
             </CardHeader>
             <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <Label>Employee</Label>
                         <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newLeave.userId}
                            onChange={(e) => setNewLeave({...newLeave, userId: e.target.value})}
                            required
                         >
                            <option value="">Select Staff Member</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}
                         </select>
                      </div>
                      <div className="space-y-2">
                         <Label>Leave Type</Label>
                         <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newLeave.type}
                            onChange={(e) => setNewLeave({...newLeave, type: e.target.value})}
                         >
                            <option value="Sick">Sick Leave</option>
                            <option value="Annual">Annual Leave</option>
                            <option value="Casual">Casual Leave</option>
                            <option value="Emergency">Emergency</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <Label>Start Date</Label>
                         <Input type="date" required value={newLeave.startDate} onChange={(e) => setNewLeave({...newLeave, startDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <Label>End Date</Label>
                         <Input type="date" required value={newLeave.endDate} onChange={(e) => setNewLeave({...newLeave, endDate: e.target.value})} />
                      </div>
                   </div>
                    <div className="space-y-2">
                         <Label>Reason / Notes</Label>
                         <Input placeholder="e.g. Doctor's appointment" value={newLeave.reason} onChange={(e) => setNewLeave({...newLeave, reason: e.target.value})} />
                    </div>
                   <div className="flex justify-end gap-2 pt-2">
                       <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                       <Button type="submit">Submit Log</Button>
                   </div>
                </form>
             </CardContent>
          </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
             <div className="text-center py-10 opacity-50">Loading requests...</div>
        ) : leaves.length === 0 ? (
           <Card className="p-8 text-center text-muted-foreground bg-muted/20 border-dashed">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3>No leave records found</h3>
           </Card>
        ) : (
           leaves.map((leave) => (
             <Card key={leave.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${
                             leave.type === 'Sick' ? 'bg-red-500' : 
                             leave.type === 'Annual' ? 'bg-blue-500' : 'bg-orange-500'
                         }`}>
                             {leave.type.charAt(0)}
                         </div>
                         <div>
                            <h3 className="font-bold text-lg">{leave.employees?.full_name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={`px-2 py-0.5 rounded textxs font-medium ${
                                    leave.type === 'Sick' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                   {leave.type} Leave
                                </span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{leave.start_date} to {leave.end_date}</span>
                            </div>
                            <p className="text-sm mt-1">"{leave.reason}"</p>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         {leave.status === 'Pending' ? (
                            <>
                               <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => updateStatus(leave.id, 'Rejected')}>
                                  Reject
                               </Button>
                               <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1" onClick={() => updateStatus(leave.id, 'Approved')}>
                                  <Check className="h-4 w-4" /> Approve
                               </Button>
                            </>
                         ) : (
                            <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                                leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {leave.status === 'Approved' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                                {leave.status}
                            </div>
                         )}
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))
        )}
      </div>
    </div>
  );
}
