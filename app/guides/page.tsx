import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { Footer } from '@/components/footer';
import { Metadata } from 'next';
import { getAllArticles } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'AI App Marketing Guides | Redverse - Complete Xiaohongshu Strategy',
  description: 'Complete guide to marketing AI apps in China through Xiaohongshu. Learn algorithm insights, traffic optimization, and viral content strategies from experts.',
  keywords: ['promote app in China guide', 'market your app in China', 'launch app in Chinese market', 'Xiaohongshu marketing', 'Redverse', 'app localization China', 'Chinese social media promotion'],
  authors: [{ name: 'lantianlaoli' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AI App Marketing Guides | Redverse',
    description: 'Complete guide to marketing AI apps in China through Xiaohongshu. Learn algorithm insights, traffic optimization, and viral content strategies.',
    url: 'https://www.redverse.online/guides',
    siteName: 'Redverse',
    images: [
      {
        url: '/twitter.png',
        width: 1200,
        height: 630,
        alt: 'AI App Marketing Guides - Redverse',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI App Marketing Guides | Redverse',
    description: 'Complete guide to marketing AI apps in China through Xiaohongshu.',
    images: ['/twitter.png'],
    creator: '@redverse',
  },
  alternates: {
    canonical: '/guides',
  },
};

export default async function GuidesPage() {
  const articles = await getAllArticles();
  
  const guides = articles.length > 0 ? articles.map((article, index) => ({
    id: article.slug,
    title: article.title,
    subtitle: '', // We can extend the Article interface later to include subtitle
    description: article.content.substring(0, 150) + '...', // First 150 chars as description
    estimatedTime: `${Math.max(1, Math.ceil(article.content.length / 1000))} min read`,
    category: 'Guide', // Default category, can be extended later
    order: index + 1
  })) : [
    // Fallback to original static data if no articles in database
    {
      id: 'algorithm-deep-dive',
      title: 'Algorithm Deep Dive',
      subtitle: 'Master the CES Scoring System',
      description: 'Uncover the foundational principles of Xiaohongshu\'s recommendation algorithm and learn to optimize your content for maximum reach.',
      estimatedTime: '8 min read',
      category: 'Core Algorithm',
      order: 1
    },
    {
      id: 'traffic-sources-analysis', 
      title: 'Traffic Sources Analysis',
      subtitle: 'Where Your Views Come From',
      description: 'Discover the three main traffic channels on Xiaohongshu and how to leverage each one for consistent growth.',
      estimatedTime: '6 min read',
      category: 'Traffic Strategy',
      order: 2
    },
    {
      id: 'push-mechanisms-explained',
      title: 'Push Mechanisms Explained',
      subtitle: 'The Five Distribution Systems',
      description: 'Master the five sophisticated push mechanisms that determine how your content reaches the right audience.',
      estimatedTime: '7 min read',
      category: 'Distribution Logic',
      order: 3
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Strategies', 
      subtitle: 'Scale Your Content Impact',
      description: 'Advanced techniques for maximizing your content\'s viral potential using decentralized and paid promotion strategies.',
      estimatedTime: '5 min read',
      category: 'Growth Tactics',
      order: 4
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Guides' }]} />
        </div>
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            AI App Marketing in China: Complete Guide
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Everything AI developers need to know about successfully launching and promoting their apps in the Chinese market.
          </p>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link 
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {guide.category}
                </span>
                <span className="text-xs text-gray-500">{guide.estimatedTime}</span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {guide.title}
              </h3>
              
              {guide.subtitle && (
                <p className="text-sm text-gray-600 mb-3">
                  {guide.subtitle}
                </p>
              )}
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {guide.description}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                Read Guide
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

      </div>
      
      <Footer />
    </div>
  );
}