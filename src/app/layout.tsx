import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

export const metadata: Metadata = {
  title: "Jaanvi's Sweet Seats",
  description: 'Effortless event seating arrangements by Seating Savior.',
  manifest: '/manifest.json', // Link to the manifest file
  icons: {
    icon: '/favicon.ico', // Standard favicon
    apple: '/icons/icon-192x192.png', // Apple touch icon
  },
  applicationName: "Jaanvi's Sweet Seats",
  appleWebApp: {
    capable: true,
    title: "Jaanvi's Sweet Seats",
    statusBarStyle: 'default', // or 'black', 'black-translucent'
  },
};

export const viewport: Viewport = {
  themeColor: '#008080', // Matches theme_color in manifest
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
