"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Send, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToast, ToastContainer } from "@/components/ui/toast";

interface LeaveRecord {
  id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

  const QUOTAS = {
    Annual: 20,
    Sick: 10,
    Casual: 5,
    Emergency: 3
  };

export default function StaffLeavePage() {
  const [loading, setLoading] = useState(false);
  const [myLeaves, setMyLeaves] = useState<LeaveRecord[]>([]);
  const [balances, setBalances] = useState(QUOTAS);
  const supabase = createClient();
  const { toasts, toast, dismiss } = useToast();

  const [formData, setFormData] = useState({
    type: "Annual",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchMyLeaves = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
       const leaves = data as LeaveRecord[];
       setMyLeaves(leaves);

       // Calculate balances based on approved leaves this year
       const currentYear = new Date().getFullYear();
       const used = { Annual: 0, Sick: 0, Casual: 0, Emergency: 0 };
       
       leaves.forEach(l => {
          if (l.status === 'Approved' && l.start_date.startsWith(currentYear.toString())) {
             const start = new Date(l.start_date);
             const end = new Date(l.end_date);
             const diffTime = Math.abs(end.getTime() - start.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end
             
             if (used[l.type as keyof typeof used] !== undefined) {
                used[l.type as keyof typeof used] += diffDays;
             }
          }
       });

       setBalances({
          Annual: QUOTAS.Annual - used.Annual,
          Sick: QUOTAS.Sick - used.Sick,
          Casual: QUOTAS.Casual - used.Casual,
          Emergency: QUOTAS.Emergency - used.Emergency,
       });
    }
  };

  useEffect(() => { fetchMyLeaves(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast("error", "Not Authenticated", "Please log in to submit a leave request.");
      setLoading(false);
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end < start) {
      toast("warning", "Invalid Dates", "End date cannot be before start date.");
      setLoading(false);
      return;
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const currentBalance = balances[formData.type as keyof typeof balances];
    if (requestedDays > currentBalance) {
      toast("error", "Insufficient Balance", `You requested ${requestedDays} days, but only have ${currentBalance} ${formData.type} days left.`);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('leave_requests').insert({
      user_id: user.id,
      type: formData.type,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      status: 'Pending',
    });

    if (error) {
      toast("error", "Submission Failed", error.message);
    } else {
      toast("success", "Request Submitted", "Your leave application is pending admin approval.");
      setFormData({ type: "Annual", startDate: "", endDate: "", reason: "" });
      fetchMyLeaves();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Leave Requests</h1>
        <p className="text-muted-foreground">Submit and track your time-off applications.</p>
      </div>

      {/* Balances Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {Object.entries(balances).map(([type, balance]) => (
            <Card key={type} className="bg-primary/5 border-primary/20">
               <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{balance}</div>
                  <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{type}</div>
               </CardContent>
            </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle>New Request</CardTitle>
            <CardDescription>Fill in the details below to apply for leave.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  placeholder="Brief reason for absence..."
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="mr-2 h-4 w-4" /> Submit Application</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Request History</h3>
          {myLeaves.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
              <Calendar className="h-10 w-10 mx-auto mb-3 opacity-20" />
              No leave requests yet.
            </div>
          ) : (
            myLeaves.map((leave) => (
              <Card key={leave.id} className="overflow-hidden">
                <div className={`h-1.5 w-full ${
                  leave.status === 'Approved' ? 'bg-green-500' :
                  leave.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-400'
                }`} />
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{leave.type} Leave</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {leave.start_date} → {leave.end_date}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                      leave.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      leave.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {leave.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                      {leave.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {leave.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {leave.status}
                    </div>
                  </div>
                  {leave.reason && (
                    <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded mt-2">
                      &ldquo;{leave.reason}&rdquo;
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
