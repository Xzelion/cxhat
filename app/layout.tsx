import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/lib/error-boundary';
import { ChatProvider } from '@/lib/chat-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Minnit Chat Clone',
  description: 'A real-time chat application with instant access',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <ChatProvider>
              {children}
              <Toaster />
            </ChatProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}