"use client";

import type { FC } from 'react';
import Image from 'next/image';

interface HeaderProps {
  appName: string;
}

const Header: FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="bg-card py-4 px-6 shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <Image
          src="/images/app-logo.png" // Point to the local image
          alt="App Logo"
          data-ai-hint="flower logo"
          width={32}
          height={32}
          className="h-8 w-8"
          priority // Preload logo as it's LCP candidate
          onError={(e) => {
            // Fallback to placeholder if local image fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop if placeholder also fails
            target.src = 'https://placehold.co/32x32.png';
            // Optionally update the data-ai-hint if fallback is used
            // Note: Accessing parentElement to set data-ai-hint might be less direct
            // if Image component wraps the img tag in other elements.
            // However, for a simple placeholder, updating the src is the main goal.
            // Consider logging or a more robust way to update hints if needed for complex structures.
            const parent = target.parentElement;
            if (parent && parent.tagName === 'PICTURE') { // next/image often wraps img in picture
                parent.setAttribute('data-ai-hint', 'placeholder flower');
            } else if (parent) {
                parent.setAttribute('data-ai-hint', 'placeholder flower');
            }
          }}
        />
        <h1 className="text-3xl font-bold text-primary">{appName}</h1>
      </div>
    </header>
  );
};

export default Header;
