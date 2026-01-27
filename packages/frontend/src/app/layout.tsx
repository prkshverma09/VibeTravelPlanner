import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TripProvider } from '@/context/TripContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vibe-Check Travel Planner',
  description: 'Discover destinations that match your vibe using AI-powered search',
  keywords: ['travel', 'destinations', 'AI', 'vibe', 'discovery'],
  authors: [{ name: 'Vibe-Check Team' }],
  openGraph: {
    title: 'Vibe-Check Travel Planner',
    description: 'Discover destinations that match your vibe',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TripProvider>{children}</TripProvider>
      </body>
    </html>
  );
}
