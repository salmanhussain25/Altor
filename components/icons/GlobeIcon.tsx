import React from 'react';

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3.75h.008v.008H10.5v-.008ZM10.5 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0ZM3.75 21a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0ZM21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
  </svg>
);
