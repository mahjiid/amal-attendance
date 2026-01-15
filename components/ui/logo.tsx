import React from 'react';

export const AmalTechLogo = ({ className = "h-8 w-auto" }: { className?: string }) => (
  <svg 
    viewBox="0 0 300 100" 
    className={className} 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Icon Group */}
    <g transform="translate(10, 10)">
       {/* The "A" shape */}
       {/* Left Orange Stroke */}
       <path d="M 30 70 L 50 20 L 65 20" stroke="#f97316" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
       
       {/* Right/Top Dark Blue Stroke -> Changed to Vibrant Blue for visibility */}
       <path d="M 50 20 L 90 20 L 90 35 L 70 35 L 70 50 L 90 50" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
       
       {/* Circuit Semi-Circle Base */}
       <path d="M 20 55 Q 55 95 90 55" stroke="#f97316" strokeWidth="3" fill="none" />
       <line x1="20" y1="55" x2="90" y2="55" stroke="#f97316" strokeWidth="2" />
       
       {/* Circuit Nodes in Semi-Circle */}
       <circle cx="35" cy="65" r="3" stroke="#f97316" strokeWidth="2" fill="none"/>
       <path d="M 38 65 H 50" stroke="#f97316" strokeWidth="2" />
       <circle cx="55" cy="65" r="3" fill="#f97316" />
       
       <circle cx="75" cy="75" r="3" stroke="#f97316" strokeWidth="2" fill="none"/>
       <path d="M 60 65 V 75 H 72" stroke="#f97316" strokeWidth="2" />
    </g>

    {/* Text Group */}
    <g transform="translate(110, 0)">
        {/* Main Title: Amal -> Foreground Color (Dark in Light Mode) */}
        <text x="0" y="55" fontFamily="var(--font-inter)" fontWeight="900" fontSize="60" className="fill-foreground" letterSpacing="-1">
          Amal
        </text>
        
        {/* Subtitles: TECH LIMITED -> Secondary Blue */}
        <text x="5" y="75" fontFamily="var(--font-inter)" fontWeight="600" fontSize="14" className="fill-secondary" letterSpacing="6">
          T E C H
        </text>
        <text x="5" y="92" fontFamily="var(--font-inter)" fontWeight="600" fontSize="14" className="fill-secondary" letterSpacing="3">
          LIMITED
        </text>
    </g>
  </svg>
);
