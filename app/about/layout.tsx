import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About One Cloud | Simple File Management',
  description:
    'Learn about One Cloud, our mission, founder Argo Talukder, and the file-management tools designed to help users organize and access their files more easily.',
  openGraph: {
    title: 'About One Cloud | Simple File Management',
    description:
      'Learn about One Cloud, our mission, founder Argo Talukder, and the file-management tools designed to help users organize and access their files more easily.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About One Cloud | Simple File Management',
    description:
      'Learn about One Cloud, our mission, founder Argo Talukder, and the file-management tools designed to help users organize and access their files more easily.',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
