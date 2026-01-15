"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { CheckCheck, Trash2, Bell } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, markAllAsRead, markAsRead } = useNotifications();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight glow-text">Notifications</h1>
            <p className="text-muted-foreground">Alerts and system updates.</p>
         </div>
         <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark All Read
         </Button>
      </div>

      <div className="space-y-4">
         {notifications.length === 0 ? (
             <Card className="p-12 text-center text-muted-foreground border-dashed bg-muted/20">
                 <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                 <h3>All caught up! No notifications.</h3>
             </Card>
         ) : (
             notifications.map((n) => (
                 <Card key={n.id} className={`transition-all hover:shadow-md ${!n.read ? 'border-l-4 border-l-primary bg-primary/5' : 'opacity-80'}`}>
                     <CardContent className="p-6 flex items-start justify-between gap-4">
                         <div className="space-y-1">
                             <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                                    n.type === 'error' ? 'bg-red-100 text-red-700' :
                                    n.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                                    'bg-blue-100 text-blue-700'
                                }`}>
                                   {n.type}
                                </span>
                                <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                             </div>
                             <h3 className={`font-semibold text-lg ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                 {n.title}
                             </h3>
                             <p className="text-sm text-muted-foreground">{n.message}</p>
                         </div>
                         {!n.read && (
                             <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)} title="Mark as read">
                                <CheckCheck className="h-4 w-4" />
                             </Button>
                         )}
                     </CardContent>
                 </Card>
             ))
         )}
      </div>
    </div>
  );
}
