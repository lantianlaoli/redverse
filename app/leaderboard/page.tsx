import { Metadata } from 'next';
import { Leaderboard } from "@/components/leaderboard";
import { Footer } from "@/components/footer";
import { ScrollAnimation } from "@/components/scroll-animation";
import { LeaderboardStats } from "@/components/leaderboard-stats";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Leaderboard - Top Performing AI Apps on Xiaohongshu | Redverse",
  description: "Discover the most successful AI apps that went viral on Xiaohongshu. See real engagement metrics, likes, views, and comments from top-performing launches.",
  keywords: ["AI app leaderboard", "Xiaohongshu success stories", "viral AI apps China", "top performing apps", "engagement metrics", "Chinese market leaders"],
  openGraph: {
    title: "Leaderboard - Top Performing AI Apps on Xiaohongshu",
    description: "Discover the most successful AI apps that went viral on Xiaohongshu. See real engagement metrics and learn from top performers.",
    url: 'https://www.redverse.online/leaderboard',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Redverse Leaderboard - Top AI Apps Performance',
      },
    ],
  },
  twitter: {
    title: "Leaderboard - Top Performing AI Apps on Xiaohongshu",
    description: "Discover the most successful AI apps that went viral on Xiaohongshu. See real engagement metrics and learn from top performers.",
  },
  alternates: {
    canonical: '/leaderboard',
  },
};

export default function LeaderboardPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "AI Apps Leaderboard - Xiaohongshu Performance Rankings",
    "description": "Rankings of top-performing AI applications on Xiaohongshu platform, showing engagement metrics and success stories.",
    "url": "https://www.redverse.online/leaderboard",
    "mainEntity": {
      "@type": "ItemList",
      "name": "Top AI Apps on Xiaohongshu",
      "description": "Ranked list of AI applications by engagement metrics on Xiaohongshu platform",
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
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24">
        {/* Header Section */}
        <div className="text-center mb-12">
          <ScrollAnimation animation="fadeInUp">
            {/* Page Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI Apps Leaderboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the most successful AI applications that achieved viral status on Xiaohongshu. 
              See real engagement metrics, learn from top performers, and get inspired for your own launch.
            </p>
          </ScrollAnimation>
        </div>

        {/* Stats Section */}
        <ScrollAnimation animation="fadeInUp" delay={200}>
          <LeaderboardStats />
        </ScrollAnimation>

        {/* Leaderboard */}
        <ScrollAnimation animation="fadeIn" delay={400}>
          <div className="mb-16">
            <Leaderboard />
          </div>
        </ScrollAnimation>

        {/* Call to Action */}
        <ScrollAnimation animation="fadeInUp" delay={600}>
          <div className="text-center py-16 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Join the Leaderboard?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Launch your AI app on Xiaohongshu and reach millions of Chinese users. 
              Get featured among the top performers.
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