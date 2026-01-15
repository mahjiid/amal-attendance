"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "System Update",
      message: "Attendance System v2.4.1 is now live.",
      type: "info",
      timestamp: "Just now",
      read: false
    },
    {
      id: "2",
      title: "New Leave Request",
      message: "Mary Effiong requested Annual Leave.",
      type: "warning",
      timestamp: "2 mins ago",
      read: false
    },
     {
      id: "3",
      title: "Late Arrival Alert",
      message: "Fidelis Ofordum clocked in at 08:45 AM.",
      type: "error",
      timestamp: "1 hour ago",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotif: Notification = {
      ...n,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
