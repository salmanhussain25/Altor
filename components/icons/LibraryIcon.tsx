
import React from 'react';

export const LibraryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25v12.553a2.67 2.67 0 0 1-2.23-2.231 2.67 2.67 0 0 1 2.23-2.231" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.966 8.966 0 0 1 18 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 16.5v1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 15h-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 15h1.5" />
  </svg>
);
