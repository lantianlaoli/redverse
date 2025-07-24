import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Dashboard - Redverse | Platform Management",
  description: "Redverse admin dashboard for platform management, user oversight, and system administration. Access restricted to authorized personnel only.",
  openGraph: {
    title: "Admin Dashboard - Redverse | Platform Management", 
    description: "Redverse admin dashboard for platform management and system administration.",
    url: 'https://www.redverse.online/admin',
  },
  robots: {
    index: false, // Admin pages should never be indexed
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  alternates: {
    canonical: '/admin',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}