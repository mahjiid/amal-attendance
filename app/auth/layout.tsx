"use client";
import React from "react";
import { PCBCircuit, CodeStream } from "@/components/ui/tech-visuals";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Background FX */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
         <PCBCircuit className="w-full h-full text-primary animate-pulse" style={{ animationDuration: '4s' }} />
      </div>
      <CodeStream className="absolute top-0 left-0 h-full w-full opacity-5 pointer-events-none z-0" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
