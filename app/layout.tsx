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
  title: 'One Cloud — Telegram-Powered Cloud Drive',
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
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'One Cloud — Telegram-Powered Cloud Drive',
    description:
      'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'One Cloud — Telegram-Powered Cloud Drive',
    description:
      'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
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
