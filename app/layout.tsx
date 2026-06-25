import { auth } from '@/auth';
import ThemeProvider from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { inter, spaceGrotesk } from '@/config/font';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.icons.icon,
  },
};

export default async function GlobalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/devicon.min.css"
        />
      </head>
      <body
        className={`${inter.className} ${spaceGrotesk.variable} antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
