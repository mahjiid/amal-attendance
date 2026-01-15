"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileText, Upload, Download, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Interface matching Supabase employees table
interface Employee {
  id: string; 
  email: string;
  full_name: string; // Changed from name to full_name for clarity
  role: string;
  department: string;
  status: string;
  avatar_url?: string;
  last_active?: string;
}

export default function AdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchEmployees = async () => {
    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('id', { ascending: true });
    
    if (data) {
        setEmployees(data as Employee[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    alert("CSV Import is currently disabled while validating with Supabase.");
  };

  const downloadTemplate = () => {
      const headers = "Staff ID,Full Name,Role,Department,Email Address";
      const sample = "101,John Doe,Factory Worker,Production,john@example.com";
      const blob = new Blob([`${headers}\n${sample}`], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'staff_import_template.csv';
      a.click();
  };

  const [newEmpId, setNewEmpId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newEmpName, setNewEmpName] = useState("");
  const [newEmpRole, setNewEmpRole] = useState("");
  const [newEmpDept, setNewEmpDept] = useState("Factory");

  const handleAddManual = () => {
      alert("To add a new staff member, please use the 'Sign Up' page to create their account and profile simultaneously.\n\n(Admin creation of users requires Service Role permissions which are not currently configured).");
      setIsAdding(false);
  };

  return (
    <div className="space-y-6">
       {/* ... Header and Stats ... */}
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight glow-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage employees and system settings.</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                <Download className="h-4 w-4" /> Template
            </Button>
            <div className="relative">
                <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button className="gap-2 bg-primary text-white hover:bg-primary/90">
                    <Upload className="h-4 w-4" /> Import CSV
                </Button>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setIsAdding(!isAdding)}>
                <Plus className="h-4 w-4" /> {isAdding ? "Cancel" : "Add Manually"}
            </Button>
         </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employees.length}</div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Today</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {employees.filter(e => e.status === 'Active').length}
              </div>
              <p className="text-xs text-muted-foreground">Based on current status</p>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
            </CardContent>
          </Card>
       </div>

       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
              <CardTitle>Employee Database</CardTitle>
              <div className="text-xs text-muted-foreground font-mono">
                 DB_VERSION: 2.4.1
              </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="rounded-md border border-white/5 overflow-hidden">
             <div className="grid grid-cols-5 p-4 font-medium text-muted-foreground border-b border-white/5 bg-white/5 text-xs uppercase tracking-wider">
                <div>Staff ID</div>
                <div className="col-span-1">Name / Role</div>
                <div>Department</div>
                <div>Status</div>
                <div className="text-right">Action</div>
             </div>
             <div className="max-h-[500px] overflow-y-auto">
                 {isAdding && (
                    <div className="grid grid-cols-5 p-4 items-center bg-primary/5 border-b border-primary/20 animate-in slide-in-from-top-2">
                       <div className="font-mono text-xs text-muted-foreground flex items-center gap-1">
                           <span className="text-muted-foreground/50">AMT-</span>
                           <input 
                              type="number"
                              className="w-16 bg-background border border-primary/30 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary font-mono text-foreground"
                              value={newEmpId}
                              onChange={(e) => setNewEmpId(e.target.value)}
                           />
                       </div>
                       <div className="col-span-1 space-y-2">
                         <input 
                            autoFocus
                            placeholder="Full Name" 
                            className="w-full bg-background border border-primary/30 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={newEmpName}
                            onChange={(e) => setNewEmpName(e.target.value)}
                         />
                         <input 
                            placeholder="Role (e.g. Operator)" 
                            className="w-full bg-background border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            value={newEmpRole}
                            onChange={(e) => setNewEmpRole(e.target.value)}
                         />
                       </div>
                       <div className="text-sm text-muted-foreground">
                          <select 
                             className="w-full bg-background border border-primary/30 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                             value={newEmpDept}
                             onChange={(e) => setNewEmpDept(e.target.value)}
                          >
                              <option value="Factory">Factory</option>
                              <option value="Engineering">Engineering</option>
                              <option value="Administration">Admin</option>
                              <option value="Logistics">Logistics</option>
                          </select>
                       </div>
                       <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-500/10 text-green-500">
                            Active
                          </span>
                       </div>
                       <div className="text-right">
                          <Button size="sm" onClick={handleAddManual} className="h-8 text-xs bg-primary text-white hover:bg-primary/90">
                             Save
                          </Button>
                       </div>
                    </div>
                 )}
                 {employees.map((employee) => (
                    <div key={employee.id} className="grid grid-cols-5 p-4 items-center hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 group">
                       <div className="font-mono text-xs text-muted-foreground truncate" title={employee.id}>
                           AMT-{employee.id.slice(0, 4)}...
                       </div>
                       <div className="col-span-1">
                         <div className="font-medium text-foreground">{employee.full_name}</div>
                         <div className="text-xs text-muted-foreground">{employee.role}</div>
                       </div>
                       <div className="text-sm text-muted-foreground">{employee.department}</div>
                       <div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                            ${employee.status === 'Active' ? 'bg-green-500/10 text-green-500' : 
                              employee.status === 'On Leave' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-muted text-muted-foreground'}`}>
                            {employee.status}
                          </span>
                       </div>
                       <div className="text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 text-xs">Edit</Button>
                       </div>
                    </div>
                 ))}
             </div>
           </div>
         </CardContent>
       </Card>
    </div>
  )
}
