import React from "react";

export default function Logo({ size = 220, className = "" }) {
  return (
    <div
      className={`logo-wrapper ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id="amberGold"
            x1="100"
            y1="100"
            x2="400"
            y2="400"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient
            id="slateMetal"
            x1="256"
            y1="0"
            x2="256"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <filter id="gloss" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="5"
              specularConstant="0.75"
              specularExponent="20"
              lightingColor="#ffffff"
              result="specOut"
            >
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite
              in="specOut"
              in2="SourceAlpha"
              operator="in"
              result="specOut"
            />
            <feComposite
              in="SourceGraphic"
              in2="specOut"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
            />
          </filter>
        </defs>
        <path
          d="M140 160 C140 130 180 120 256 120 C332 120 372 130 372 160 V380 C372 410 332 400 256 400 C180 400 140 410 140 380 V160 Z"
          fill="#F59E0B"
          fillOpacity="0.15"
          transform="translate(12, 12)"
        />
        <path
          d="M140 160 C140 130 180 120 256 120 C332 120 372 130 372 160 V380 C372 410 332 400 256 400 C180 400 140 410 140 380 V160 Z"
          fill="#334155"
        />
        <path
          d="M256 130 C190 130 150 140 150 160 V370 C150 350 190 340 256 340 V130 Z"
          fill="url(#slateMetal)"
        />
        <text
          x="203"
          y="280"
          fontFamily="'Times New Roman', serif"
          fontWeight="bold"
          fontSize="100"
          fill="#475569"
          textAnchor="middle"
          opacity="0.8"
        >
          M
        </text>
        <path
          d="M256 130 C322 130 362 140 362 160 V370 C362 350 322 340 256 340 V130 Z"
          fill="url(#amberGold)"
          filter="url(#gloss)"
        />
        <text
          x="309"
          y="280"
          fontFamily="'Times New Roman', serif"
          fontWeight="bold"
          fontSize="100"
          fill="white"
          textAnchor="middle"
          opacity="0.95"
        >
          F
        </text>
        <path
          d="M256 120 V410"
          stroke="white"
          strokeWidth="3"
          strokeOpacity="0.4"
        />
        <circle cx="256" cy="230" r="12" fill="white" fillOpacity="0.9" />
        <circle
          cx="256"
          cy="230"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
      </svg>
    </div>
  );
}
