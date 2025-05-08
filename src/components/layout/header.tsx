import type { FC } from 'react';
import { Armchair } from 'lucide-react';

interface HeaderProps {
  appName: string;
}

const Header: FC<HeaderProps> = ({ appName }) => {
  return (
    <header className="bg-card py-4 px-6 shadow-md sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto flex items-center gap-3">
        <Armchair className="h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-primary">{appName}</h1>
      </div>
    </header>
  );
};

export default Header;
