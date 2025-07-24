import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Admin Login - Redverse | Secure Access",
  description: "Secure admin login for Redverse platform management. Access restricted to authorized administrators only.",
  robots: {
    index: false, // Login pages should never be indexed
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  alternates: {
    canonical: '/admin/login',
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}