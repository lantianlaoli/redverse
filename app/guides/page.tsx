import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/breadcrumb';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI App Marketing Guides | Redverse - Complete Xiaohongshu Strategy',
  description: 'Complete guide to marketing AI apps in China through Xiaohongshu. Learn algorithm insights, traffic optimization, and viral content strategies from experts.',
  keywords: ['AI app marketing China', 'Xiaohongshu marketing guide', 'AI app China launch', 'redbook marketing strategy', 'China app promotion', 'viral marketing China', 'AI startup China'],
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

export default function GuidesPage() {
  const guides = [
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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full opacity-10 blur-3xl"></div>
      </div>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb items={[{ label: 'Guides' }]} />
        </div>
        <div className="min-h-[60vh] flex flex-col justify-center items-center text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl mb-4 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
              AI App Marketing in China:
            </span>
            <br />
            <span className="text-gray-900">Complete Guide</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-4xl leading-relaxed">
            Everything AI developers need to know about successfully launching and promoting their apps in the Chinese market. 
            Get expert answers to your most important questions about Xiaohongshu marketing and professional promotion services.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              500+ Apps Launched
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              50M+ Chinese Users Reached
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              95% Success Rate
            </div>
          </div>
        </div>

        {/* Guide Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {guides.map((guide, index) => (
            <Link 
              key={guide.id}
              href={`/guides/${guide.id}`}
              className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-500 hover:border-gray-300/50 hover:-translate-y-2 hover:bg-white/90 relative overflow-hidden"
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent opacity-50 rounded-2xl"></div>
              
              {/* Category icon */}
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-green-100 text-green-600' :
                      index === 2 ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />}
                        {index === 1 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />}
                        {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />}
                        {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                      </svg>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      index === 0 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      index === 1 ? 'bg-green-50 text-green-700 border border-green-200' :
                      index === 2 ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {guide.category}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">{guide.estimatedTime}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors leading-tight">
                  {guide.title}
                </h3>
                
                <p className="text-lg text-gray-700 mb-4 font-medium">
                  {guide.subtitle}
                </p>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {guide.description}
                </p>
                
                <div className="flex items-center text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  Read Guide
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Resources */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-3xl"></div>
          <div className="relative">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why These Guides Matter
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">Algorithm Insights</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Understand how Xiaohongshu&apos;s recommendation system works behind the scenes.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">Content Optimization</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Learn practical strategies to increase your content&apos;s reach and engagement.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">2025 Updates</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Stay current with the latest algorithm changes and best practices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}