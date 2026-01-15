"use client";
import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { AmalTechLogo } from "./logo";
import { Wifi, Cpu, Fingerprint } from "lucide-react";

interface HolographicCardProps {
  name: string;
  role: string;
  idNumber: string;
  className?: string;
}

export function HolographicCard({ name, role, idNumber, className }: HolographicCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className={cn(
        "relative h-[240px] w-full max-w-[400px] rounded-xl bg-gradient-to-br from-black/80 to-slate-900 border border-white/10 shadow-2xl transition-all duration-200 ease-out preserve-3d group cursor-pointer",
        className
      )}
    >
      {/* Holographic Sheen */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 40%, rgba(249,115,22,0.1) 45%, rgba(37,99,235,0.1) 50%, rgba(255,255,255,0.05) 55%, transparent 80%)",
          filter: "brightness(1.2) contrast(1.2)"
        }}
      />

      <div className="absolute inset-4 flex flex-col justify-between" style={{ transform: "translateZ(30px)" }}>
         <div className="flex justify-between items-start">
            <AmalTechLogo className="h-8 w-auto opacity-90" />
            <Wifi className="h-6 w-6 text-primary animate-pulse" />
         </div>

         <div className="flex items-end justify-between">
           <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Employee Name</div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{name}</h3>
              <p className="text-sm text-primary font-medium">{role}</p>
           </div>
           
           <div className="text-right">
              <Cpu className="h-8 w-8 text-secondary mb-2 opacity-50 ml-auto" />
              <div className="text-xs text-muted-foreground font-mono">{idNumber}</div>
           </div>
         </div>
         
         <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
            <span>ISSUED: 2026</span>
            <div className="flex items-center gap-1">
               <Fingerprint className="h-4 w-4 text-emerald-500" />
               VERIFIED
            </div>
         </div>
      </div>
    </motion.div>
  );
}
