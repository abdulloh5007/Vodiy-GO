import React from 'react';

export const RoadPilotLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);


export const CarFront = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10H8s-2.7.6-4.5.9A2 2 0 0 0 2 13v3c0 .6.4 1 1 1h2" />
    <path d="M12 10V6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v4" />
    <path d="m21 17-2-4h-2" />
    <path d="m3 17 2-4h2" />
    <path d="M12 10h0" />
    <path d="M6 15h.01" />
    <path d="M18 15h.01" />
  </svg>
);

export const CarRear = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 17h14" />
    <path d="M5 17a2 2 0 0 0-2 2v1h18v-1a2 2 0 0 0-2-2Z" />
    <path d="M19 17V11a2.15 2.15 0 0 0-1-1.83l-2-1.17" />
    <path d="M5 17V11a2.15 2.15 0 0 1 1-1.83l2-1.17" />
    <path d="M16 8h-2.22a2 2 0 0 1-1.89-1.3L11.21 5H8.79L8.1 6.7A2 2 0 0 1 6.22 8H4" />
    <path d="M8 12h8" />
    <path d="M9 16h6" />
  </svg>
);

export const CarSide = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
    <path d="M15 12.3V6.4" />
    <path d="m9 12.3-5.7-3.3" />
    <path d="m21 8.7-5.7 3.3" />
    <path d="M17.8 15.2 12 18.6l-5.8-3.4" />
  </svg>
);


export const IdCardFront = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <path d="M6 10h4"></path>
        <path d="M15 10h3"></path>
        <path d="M6 14h2"></path>
        <path d="M10 14h8"></path>
        <circle cx="17.5" cy="9.5" r="1.5"></circle>
    </svg>
);


export const IdCardBack = (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
    >
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <path d="M2 10h20"></path>
        <path d="M6 14h12"></path>
    </svg>
);
