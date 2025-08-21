import { Metadata } from 'next';
import { Leaderboard } from "@/components/leaderboard";
import { Footer } from "@/components/footer";
import { ScrollAnimation } from "@/components/scroll-animation";
import { LeaderboardStats } from "@/components/leaderboard-stats";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Example - AI Apps on Xiaohongshu | Redverse",
  description: "Discover AI applications launched on Xiaohongshu through Redverse. See real engagement metrics, likes, views, and comments from various app launches.",
  keywords: ["app examples in China", "Xiaohongshu marketing examples", "launch app in Chinese market", "Chinese social media promotion", "Redverse examples", "app localization China", "market your app in China"],
  openGraph: {
    title: "Example - AI Apps on Xiaohongshu",
    description: "Discover AI applications launched on Xiaohongshu through Redverse. See real engagement metrics and examples.",
    url: 'https://www.redverse.online/examples',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Redverse Example - AI Apps on Xiaohongshu',
      },
    ],
  },
  twitter: {
    title: "Example - AI Apps on Xiaohongshu",
    description: "Discover AI applications launched on Xiaohongshu through Redverse. See real engagement metrics and examples.",
  },
  alternates: {
    canonical: '/examples',
  },
};

export default function ExamplesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Apps Example - Xiaohongshu Launches",
    "description": "Example of AI applications launched on Xiaohongshu platform, showing engagement metrics and launch results.",
    "url": "https://www.redverse.online/examples",
    "mainEntity": {
      "@type": "ItemList",
      "name": "AI Apps on Xiaohongshu",
      "description": "Example of AI applications launched through Redverse on Xiaohongshu platform",
      "numberOfItems": "50+"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <ScrollAnimation animation="fadeInUp">
            {/* Page Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Example
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover AI applications launched on Xiaohongshu through Redverse. 
              See real engagement metrics, explore different approaches, and get inspired for your own launch.
            </p>
          </ScrollAnimation>
        </div>

        {/* Stats Section */}
        <ScrollAnimation animation="fadeInUp" delay={200}>
          <LeaderboardStats />
        </ScrollAnimation>

        {/* Example */}
        <ScrollAnimation animation="fadeIn" delay={400}>
          <div className="mb-16">
            <Leaderboard />
          </div>
        </ScrollAnimation>

        {/* Call to Action */}
        <ScrollAnimation animation="fadeInUp" delay={600}>
          <div className="text-center py-16 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Launch Your App?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Launch your AI app on Xiaohongshu and reach millions of Chinese users. 
              Get featured in our examples showcase.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-colors text-lg"
            >
              Launch Your App
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </ScrollAnimation>
      </main>

      <Footer />
    </div>
  );
}