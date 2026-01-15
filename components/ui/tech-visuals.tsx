"use client";
import React from "react";
import { motion } from "framer-motion";

export const PCBCircuit = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <pattern id="pcb-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
       <path d="M 2 2 L 18 2 L 18 18 L 2 18 Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
       <circle cx="2" cy="2" r="0.5" fill="currentColor" opacity="0.3" />
       <circle cx="18" cy="18" r="0.5" fill="currentColor" opacity="0.3" />
       <path d="M 2 2 L 10 10 L 18 2" fill="none" stroke="currentColor" strokeWidth="0.2" opacity="0.2" />
    </pattern>
    <rect width="100%" height="100%" fill="url(#pcb-pattern)" />
    
    {/* Animated Traces */}
    <motion.path 
      d="M 10 10 L 90 10 L 90 90 L 10 90 Z" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="0.2"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      opacity="0.5"
    />
  </svg>
);

export const Microchip = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Body */}
    <rect x="12" y="12" width="40" height="40" rx="4" fill="#18181b" stroke="currentColor" strokeWidth="1" />
    
    {/* Pins */}
    {[...Array(8)].map((_, i) => (
      <React.Fragment key={i}>
         <rect x={4 + (i * 7)} y="6" width="2" height="6" fill="currentColor" opacity="0.8" />
         <rect x={4 + (i * 7)} y="52" width="2" height="6" fill="currentColor" opacity="0.8" />
         <rect x="6" y={4 + (i * 7)} width="6" height="2" fill="currentColor" opacity="0.8" />
         <rect x="52" y={4 + (i * 7)} width="6" height="2" fill="currentColor" opacity="0.8" />
      </React.Fragment>
    ))}
    
    {/* Inner Core */}
    <rect x="22" y="22" width="20" height="20" fill="currentColor" opacity="0.1" />
    <motion.rect 
      x="22" y="22" width="20" height="20" 
      stroke="currentColor" 
      strokeWidth="0.5"
      animate={{ opacity: [0.3, 0.8, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    
    {/* Logo/Text */}
    <text x="32" y="34" fontSize="6" fontWeight="bold" fill="currentColor" textAnchor="middle" opacity="0.8">AMAL</text>
  </svg>
);

export const SmartCardChip = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
     <rect x="0" y="0" width="40" height="30" rx="4" fill="#eab308" opacity="0.2" /> {/* Gold tint base */}
     <path d="M 0 10 H 12 V 0" stroke="#eab308" strokeWidth="0.5" />
     <path d="M 28 0 V 10 H 40" stroke="#eab308" strokeWidth="0.5" />
     <path d="M 0 20 H 12 V 30" stroke="#eab308" strokeWidth="0.5" />
     <path d="M 28 30 V 20 H 40" stroke="#eab308" strokeWidth="0.5" />
     
     <rect x="14" y="8" width="12" height="14" rx="2" stroke="#eab308" strokeWidth="0.5" fill="none" />
     <circle cx="20" cy="15" r="3" fill="#eab308" opacity="0.4" />
  </svg>
);

export const CodeStream = ({ className }: { className?: string }) => {
  return (
    <div className={`overflow-hidden font-mono text-[10px] leading-3 opacity-20 select-none ${className}`}>
      {[...Array(10)].map((_, i) => (
        <motion.div
           key={i}
           initial={{ y: 0 }}
           animate={{ y: -100 }}
           transition={{ duration: 10 + Math.random() * 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
        >
          {`01011001 00101010 SYSTEM_INIT...
            LOADING_KERNEL_MODULES [OK]
            CHECK_INTEGRITY [Active]
            CONNECTING_TO_IoT_GATEWAY...
            BUFFER_OVERFLOW_PROTECTION
            ENCRYPTED_STREAM_INIT
            AMAL_TECH_Secure_V4.2
            ...
          `.split('\n').map((line, j) => <div key={j} className="whitespace-nowrap">{line}</div>)}
        </motion.div>
      ))}
    </div>
  )
}
