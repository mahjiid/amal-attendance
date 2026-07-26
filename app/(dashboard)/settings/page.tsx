"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Bell, Lock, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast, ToastContainer } from "@/components/ui/toast";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const supabase = createClient();
  const { toasts, toast, dismiss } = useToast();

  useEffect(() => {
     const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data: profile } = await supabase
           .from('employees')
           .select('*')
           .eq('id', user.id)
           .single();
           
        if (profile) setUserProfile(profile);
     };
     fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);

    if (newPass || confirmPass) {
       if (newPass !== confirmPass) {
          toast("error", "Validation Error", "New passwords do not match.");
          setIsLoading(false);
          return;
       }
       if (newPass.length < 6) {
          toast("error", "Validation Error", "Password must be at least 6 characters.");
          setIsLoading(false);
          return;
       }

       const { error } = await supabase.auth.updateUser({ password: newPass });
       if (error) {
          toast("error", "Update Failed", error.message);
       } else {
          toast("success", "Password Updated", "Your password has been changed successfully.");
          setNewPass("");
          setConfirmPass("");
       }
    } else {
       toast("success", "Settings Saved", "Your preferences have been updated.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
       <ToastContainer toasts={toasts} onDismiss={dismiss} />
       <div>
         <h1 className="text-3xl font-bold tracking-tight glow-text">Settings</h1>
         <p className="text-muted-foreground">Manage your account preferences and application settings.</p>
       </div>
       
       <div className="grid gap-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                 <User className="h-5 w-5 text-primary" />
                 <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={userProfile?.full_name || "Loading..."} disabled />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" defaultValue={userProfile?.email || "Loading..."} disabled />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" defaultValue={userProfile?.role || "Loading..."} disabled />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="dept">Department</Label>
                    <Input id="dept" defaultValue={userProfile?.department || "Loading..."} disabled />
                 </div>
               </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                 <Bell className="h-5 w-5 text-secondary" />
                 <CardTitle>Notifications</CardTitle>
              </div>
              <CardDescription>Configure how you receive alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily summaries and alerts.</p>
                  </div>
                  <input type="checkbox" className="toggle-checkbox" defaultChecked />
               </div>
               <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Real-time alerts for check-ins.</p>
                  </div>
                  <input type="checkbox" className="toggle-checkbox" defaultChecked />
               </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
               <div className="flex items-center gap-2">
                 <Shield className="h-5 w-5 text-destructive" />
                 <CardTitle>Security</CardTitle>
              </div>
              <CardDescription>Manage your password and security questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="current-pass">Current Password</Label>
                  <Input id="current-pass" type="password" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="new-pass">New Password</Label>
                    <Input id="new-pass" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-pass">Confirm Password</Label>
                    <Input id="confirm-pass" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                 </div>
               </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
             <Button variant="ghost">Cancel</Button>
             <Button onClick={handleSave} disabled={isLoading}>
               {isLoading ? "Saving..." : "Save Changes"}
             </Button>
          </div>
       </div>
    </div>
  )
}
