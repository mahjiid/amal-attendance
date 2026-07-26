"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { NotificationProvider } from "@/context/NotificationContext";

/**
 * Dashboard Layout
 *
 * Auth & RBAC is enforced server-side by middleware.ts.
 * By the time this layout renders, the user is guaranteed
 * to be authenticated and have the correct role.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
