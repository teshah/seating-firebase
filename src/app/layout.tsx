import type {Metadata} from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: 'Seating Savior',
  description: 'Effortless event seating arrangements by Seating Savior.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
