import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from "@vercel/analytics/next";
import { AdminFloatingButton } from '@/components/admin-floating-button';
import { UserInitializer } from '@/components/user-initializer';
import { ConditionalHeader } from '@/components/conditional-header';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const interDisplay = Inter({
  variable: "--font-inter-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  preload: true,
});


export const metadata: Metadata = {
  title: "Redverse - AI Product Marketing on Xiaohongshu",
  description: "Help indie developers and startups promote their AI products in China. Transform your AI tools and apps into viral Xiaohongshu posts and reach millions of Chinese users.",
  keywords: ["AI product marketing China", "indie developer China marketing", "startup AI promotion China", "AI tools Xiaohongshu", "Xiaohongshu marketing", "Redverse", "AI product localization China", "Chinese social media promotion", "AI startup marketing"],
  authors: [{ name: "lantianlaoli" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/ms-icon-150x150.png',
  },
  metadataBase: new URL('https://www.redverse.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Redverse - AI Product Marketing on Xiaohongshu",
    description: "Help indie developers and startups promote their AI products in China. Transform your AI tools and apps into viral Xiaohongshu posts and reach millions of Chinese users.",
    url: 'https://www.redverse.online',
    siteName: 'Redverse',
    images: [
      {
        url: '/twitter.png',
        width: 1200,
        height: 630,
        alt: 'Redverse - AI App Marketing Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Redverse - AI Product Marketing on Xiaohongshu",
    description: "Help indie developers and startups promote their AI products in China. Transform your AI tools and apps into viral Xiaohongshu posts and reach millions of Chinese users.",
    images: ['/twitter.png'],
    creator: '@redverse',
  },
};

export const viewport = {
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="google-site-verification" content="5VLUKXmW8gT248m1IKBZFLgD4DD8pmU1TzqAAb1zASo" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <meta name="theme-color" content="#000000" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Organization",
                    "@id": "https://www.redverse.online/#organization",
                    "name": "Redverse",
                    "url": "https://www.redverse.online",
                    "logo": {
                      "@type": "ImageObject",
                      "url": "https://www.redverse.online/logo.png"
                    },
                    "description": "Bridge global AI innovation with the Chinese market through Xiaohongshu marketing",
                    "sameAs": [
                      "https://www.xiaohongshu.com/user/profile/646ced020000000011001e47"
                    ]
                  },
                  {
                    "@type": "WebSite",
                    "@id": "https://www.redverse.online/#website",
                    "url": "https://www.redverse.online",
                    "name": "Redverse",
                    "description": "Make Your AI App Go Viral in China",
                    "publisher": {
                      "@id": "https://www.redverse.online/#organization"
                    },
                    "inLanguage": "en-US"
                  },
                  {
                    "@type": "SoftwareApplication",
                    "name": "Redverse",
                    "url": "https://www.redverse.online",
                    "description": "AI app marketing platform that helps global AI innovations go viral on Xiaohongshu in China",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web",
                    "offers": {
                      "@type": "Offer",
                      "price": "0",
                      "priceCurrency": "USD",
                      "description": "Free submission and review process"
                    }
                  }
                ]
              })
            }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${interDisplay.variable} antialiased`}
        >
          <UserInitializer />
          <ConditionalHeader />
          {children}
          <AdminFloatingButton />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
