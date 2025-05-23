
"use client";

import type { FC } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
  appName: string;
}

const WISH_PARAM_KEY = 'wish';
const WISH_PARAM_VALUE = 'true';

const Header: FC<HeaderProps> = ({ appName }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogoClick = () => {
    const currentParams = new URLSearchParams(searchParams.toString());
    if (currentParams.get(WISH_PARAM_KEY) === WISH_PARAM_VALUE) {
      currentParams.delete(WISH_PARAM_KEY);
    } else {
      currentParams.set(WISH_PARAM_KEY, WISH_PARAM_VALUE);
    }
    const newQueryString = currentParams.toString();
    router.push(pathname + (newQueryString ? `?${newQueryString}` : ''));
  };

  return (
    <header className="bg-card py-4 px-6 shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <div
          onClick={handleLogoClick}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoClick();
            }
          }}
          aria-label="Toggle wish feature"
        >
          <Image
            src="/images/app-logo.png"
            alt="App Logo"
            data-ai-hint="flower logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-full"
            priority // Preload logo as it's LCP candidate
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null; // Prevent infinite loop
              target.src = 'https://placehold.co/32x32.png';
              const parent = target.parentElement;
              if (parent) {
                  const grandParent = parent.parentElement; // The div with onClick
                  if (grandParent) {
                    grandParent.setAttribute('data-ai-hint', 'placeholder flower');
                  }
              }
            }}
          />
        </div>
        <h1 className="text-3xl font-bold text-primary">{appName}</h1>
      </div>
    </header>
  );
};

export default Header;
