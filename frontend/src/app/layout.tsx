import type { Metadata } from 'next';
import './globals.css';

import { QueryProvider } from '@/lib/react-query';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { fontVariables } from '@/lib/fonts';

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
      <body className={`${fontVariables} font-inter antialiased`}>
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
