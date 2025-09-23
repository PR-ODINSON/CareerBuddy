import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { QueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CareerBuddy - AI-Powered Resume & Career Assistant',
  description: 'Build, optimize, and manage your resumes with personalized career guidance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
