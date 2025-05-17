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
          src="https://placehold.co/32x32.png"
          alt="App Logo"
          data-ai-hint="flower logo"
          width={32}
          height={32}
          className="h-8 w-8"
          priority // Preload logo as it's LCP candidate
        />
        <h1 className="text-3xl font-bold text-primary">{appName}</h1>
      </div>
    </header>
  );
};

export default Header;
