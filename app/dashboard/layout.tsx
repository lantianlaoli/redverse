import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Dashboard - Redverse | Manage Your AI App Marketing",
  description: "Access your Redverse dashboard to manage AI app marketing campaigns, track Xiaohongshu posts performance, and monitor your Chinese market growth.",
  keywords: ["AI app dashboard", "marketing campaign management", "Xiaohongshu analytics", "Chinese market tracking", "AI promotion dashboard"],
  openGraph: {
    title: "Dashboard - Redverse | Manage Your AI App Marketing",
    description: "Access your Redverse dashboard to manage AI app marketing campaigns, track Xiaohongshu posts performance, and monitor your Chinese market growth.",
    url: 'https://www.redverse.online/dashboard',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Redverse Dashboard - AI App Marketing Management',
      },
    ],
  },
  twitter: {
    title: "Dashboard - Redverse | Manage Your AI App Marketing",
    description: "Access your Redverse dashboard to manage AI app marketing campaigns and track your Chinese market growth.",
  },
  alternates: {
    canonical: '/dashboard',
  },
  robots: {
    index: false, // Dashboard pages should not be indexed
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}