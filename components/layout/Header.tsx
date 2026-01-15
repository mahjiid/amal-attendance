"use client";
import React, { useState } from "react";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
       <div className="flex items-center gap-4">
          <h2 className="text-sm font-medium text-muted-foreground hidden md:block">
             / AMAL-TECH / ATTENDANCE
          </h2>
       </div>

       <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
                placeholder="Search..." 
                className="pl-9 w-[200px] h-9 bg-secondary/5 border-border/50 focus:w-[300px] transition-all" 
             />
          </div>

          <div className="relative">
             <Button variant="ghost" size="icon" className="relative" onClick={() => setShowDropdown(!showDropdown)}>
                <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
                {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 animate-pulse ring-2 ring-background" />
                )}
             </Button>
             
             {/* Notification Dropdown */}
             {showDropdown && (
                <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                   <Card className="absolute right-0 top-12 w-[350px] z-50 border-primary/20 shadow-2xl bg-background/95 backdrop-blur-3xl animate-in fade-in zoom-in-95 slide-in-from-top-2">
                       <div className="p-4 border-b border-border/50 flex justify-between items-center">
                          <h4 className="font-semibold text-sm">Notifications</h4>
                          <Link href="/notifications" className="text-xs text-primary hover:underline" onClick={() => setShowDropdown(false)}>
                             View All
                          </Link>
                       </div>
                       <div className="max-h-[300px] overflow-y-auto">
                          {notifications.length === 0 ? (
                             <div className="p-8 text-center text-muted-foreground text-sm">
                                No new notifications
                             </div>
                          ) : (
                             notifications.slice(0, 5).map((n) => (
                                <div 
                                   key={n.id} 
                                   className={cn(
                                      "p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                                      !n.read && "bg-primary/5"
                                   )}
                                   onClick={() => markAsRead(n.id)}
                                >
                                   <div className="flex justify-between items-start mb-1">
                                      <span className={cn(
                                         "text-xs font-bold px-1.5 py-0.5 rounded",
                                         n.type === 'error' ? "bg-red-100 text-red-700" :
                                         n.type === 'warning' ? "bg-amber-100 text-amber-700" :
                                         "bg-blue-100 text-blue-700"
                                      )}>
                                         {n.type.toUpperCase()}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">{n.timestamp}</span>
                                   </div>
                                   <p className="text-sm font-medium leading-none mb-1">{n.title}</p>
                                   <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                </div>
                             ))
                          )}
                       </div>
                   </Card>
                </>
             )}
          </div>
          
          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs ring-2 ring-primary/20">
             IT
          </div>
       </div>
    </header>
  );
}
