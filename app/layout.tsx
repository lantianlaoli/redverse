import type { Metadata } from "next";
import { Geist, Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { AdminFloatingButton } from '@/components/admin-floating-button';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


const interDisplay = Inter({
  variable: "--font-inter-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});


export const metadata: Metadata = {
  title: "Redverse - Make Your AI App Go Viral in China",
  description: "Bridge global AI innovation with the Chinese market. Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users.",
  keywords: ["AI app marketing", "Xiaohongshu promotion", "Chinese market", "AI viral marketing", "social media marketing", "AI product launch", "China marketing", "RedBook marketing"],
  authors: [{ name: "Redverse" }],
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
    icon: '/favicon.png',
  },
  metadataBase: new URL('https://www.redverse.online'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Redverse - Make Your AI App Go Viral in China",
    description: "Bridge global AI innovation with the Chinese market. Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users.",
    url: 'https://www.redverse.online',
    siteName: 'Redverse',
    images: [
      {
        url: '/logo.png',
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
    title: "Redverse - Make Your AI App Go Viral in China",
    description: "Bridge global AI innovation with the Chinese market. Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users.",
    images: ['/logo.png'],
    creator: '@redverse',
  },
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
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Special+Gothic+Expanded+One:wght@400&display=swap" rel="stylesheet" />
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
          {children}
          <AdminFloatingButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
