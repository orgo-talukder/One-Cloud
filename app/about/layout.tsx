import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About One Cloud — Sovereign Telegram-Powered Personal Cloud Drive',
  description:
    'Learn about One Cloud: our mission, zero-custody cloud architecture, and how we turn your Telegram Saved Messages into a high-performance personal cloud workspace.',
  openGraph: {
    title: 'About One Cloud — Sovereign Telegram-Powered Personal Cloud Drive',
    description:
      'Learn about One Cloud: our mission, zero-custody cloud architecture, and how we turn your Telegram Saved Messages into a high-performance personal cloud workspace.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About One Cloud — Sovereign Telegram-Powered Personal Cloud Drive',
    description:
      'Learn about One Cloud: our mission, zero-custody cloud architecture, and how we turn your Telegram Saved Messages into a high-performance personal cloud workspace.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
