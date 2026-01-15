"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, Settings, LogOut, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { AmalTechLogo } from "@/components/ui/logo";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

const allLinks = [
  // Common / Staff
  { label: "My Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, roles: ['Staff'] },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard, roles: ['Admin', 'Superadmin'] },
  
  // Admin Only
  { label: "Staff Management", href: "/admin", icon: UserCheck, roles: ['Admin', 'Superadmin'] },
  { label: "Staff Logs", href: "/history", icon: Calendar, roles: ['Admin', 'Superadmin'] },
  { label: "All Requests", href: "/leave-requests", icon: Users, roles: ['Admin', 'Superadmin'] },
  
  // Common
  { label: "My Leaves", href: "/staff/leave", icon: Calendar, roles: ['Staff', 'Admin', 'Superadmin'] },
  
  // Admin Only
  { label: "System Settings", href: "/settings", icon: Settings, roles: ['Admin', 'Superadmin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
     const getRole = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (user) {
             const { data } = await supabase.from('employees').select('role').eq('email', user.email).single();
             setRole(data?.role || 'Staff');
         }
     };
     getRole();
  }, []);

  // Filter links
  const visibleLinks = allLinks.filter(link => 
      role && link.roles.includes(role)
  );

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r border-border bg-white/80 backdrop-blur-xl p-4 sticky top-0 shadow-sm">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <Link href="/" className="mb-8 block px-2">
             <AmalTechLogo className="h-10 w-auto" />
          </Link>
          <div className="space-y-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-md px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(59,130,246,0.2)] border border-primary/20"
                      : "text-muted-foreground hover:bg-black/5 hover:text-black"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="px-3 py-2">
         <button 
           onClick={async () => {
               await supabase.auth.signOut();
               window.location.href = '/auth/login';
           }}
           className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 cursor-pointer"
         >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
         </button>
      </div>
    </div>
  );
}
