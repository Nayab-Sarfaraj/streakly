import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Streakly',
  description: 'Daily habit tracker',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Sidebar />
        <main className="md:ml-48 min-h-screen pb-16 md:pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
