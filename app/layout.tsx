import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'One Cloud — Telegram-Powered Cloud Drive',
  description: 'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
  openGraph: {
    title: 'One Cloud — Telegram-Powered Cloud Drive',
    description: 'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'One Cloud — Telegram-Powered Cloud Drive',
    description: 'A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.',
  },
};

import { Providers } from '@/components/providers';

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
