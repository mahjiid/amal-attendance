"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/context/NotificationContext";
import { createClient } from "@/utils/supabase/client";
import { redirect, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const supabase = createClient();

  useEffect(() => {
     const checkAccess = async () => {
         const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
             router.push("/auth/login");
             return;
         }

         // Fetch Role
         const { data: emp } = await supabase
             .from('employees')
             .select('role')
             .eq('email', user.email)
             .single();
         
         const role = emp?.role || 'Staff'; // Default to Staff safety

         // DEFINED ZONES
         const ADMIN_ROUTES = ['/dashboard', '/admin', '/leave-requests'];
         const STAFF_ROUTES = ['/staff/dashboard', '/staff/leave'];
         
         // 1. Check Admin Routes
         // If path starts with any Admin route, Block Staff
         // Using startsWith to catch sub-pages like /admin/settings
         const isAdminZone = ADMIN_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
         
         if (isAdminZone && role === 'Staff') {
             console.log(`RBAC: Blocked Staff ${user.email} from Admin Zone ${pathname}`);
             router.replace('/staff/dashboard'); // Use replace to prevent history back loop
             return;
         }

         // 2. Check Staff Routes (Optional: Block Admin? Maybe not, Admins can probably see everything)
         // But for clarity/demo, maybe we redirect Admin to /dashboard if they try /staff/dashboard?
         // Let's keep it simple: Admins can go anywhere. Staff are restricted.

         setAuthorized(true);
     };

     checkAccess();
  }, [pathname]);

  if (!authorized) {
      // Show loading or nothing while checking
      return <div className="h-screen w-screen flex items-center justify-center bg-black text-white">Verifying Access...</div>;
  }

  return (
    <NotificationProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
          
          <Header />
          
          <div className="flex-1 overflow-y-auto p-8 relative z-10">
             {children}
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}
