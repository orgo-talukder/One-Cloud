import type { Metadata, Viewport } from 'next';
import './globals.css'; // Global styles
import { Providers } from '@/components/providers';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

export const viewport: Viewport = {
  themeColor: '#0B0E13',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'One Cloud',
  description:
    'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'One Cloud',
  },
  icons: {
    icon: [
      { url: '/favicon_logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/favicon_logo.png',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'One Cloud',
    description:
      'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'One Cloud',
    description:
      'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/png" sizes="192x192" href="/favicon_logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon_logo.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        suppressHydrationWarning
        className="bg-canvas text-text-primary antialiased selection:bg-brand-subtle selection:text-primary min-h-screen"
      >
        <ServiceWorkerRegister />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
