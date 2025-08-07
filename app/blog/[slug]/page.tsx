import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, ArrowRight } from 'lucide-react';
import { promises as fs } from 'fs';
import path from 'path';
import { CESCalculator } from '@/components/ces-calculator';
import { TrafficSourcesChart } from '@/components/traffic-sources-chart';
import { AlgorithmFlowchart } from '@/components/algorithm-flowchart';
import { Breadcrumb } from '@/components/breadcrumb';
import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Metadata } from 'next';
import { getAllArticles, getArticleBySlug } from '@/lib/supabase';

const guidesConfig = {
  'algorithm-deep-dive': {
    title: 'Algorithm Deep Dive',
    subtitle: 'Master the CES Scoring System',
    category: 'Core Algorithm',
    estimatedTime: '8 min read',
    order: 1,
    markdownFile: 'part1.md',
    description: 'Understand Xiaohongshu\'s CES algorithm scoring system. Learn how engagement, shares, and comments affect your AI app\'s reach in China.',
    keywords: ['promote app in China algorithm', 'market your app in China', 'launch app in Chinese market', 'Xiaohongshu marketing', 'Redverse algorithm guide', 'app localization China', 'Chinese social media promotion']
  },
  'traffic-sources-analysis': {
    title: 'Traffic Sources Analysis',
    subtitle: 'Where Your Views Come From',
    category: 'Traffic Strategy',
    estimatedTime: '6 min read',
    order: 2,
    markdownFile: 'part2.md',
    description: 'Discover the three main traffic sources on Xiaohongshu: discovery, search, and recommendations. Optimize your AI app content for each channel.',
    keywords: ['promote app in China traffic', 'market your app in China channels', 'launch app in Chinese market discovery', 'Xiaohongshu marketing sources', 'Redverse traffic guide', 'app localization China', 'Chinese social media promotion']
  },
  'push-mechanisms-explained': {
    title: 'Push Mechanisms Explained',
    subtitle: 'The Five Distribution Systems',
    category: 'Distribution Logic',
    estimatedTime: '7 min read',
    order: 3,
    markdownFile: 'part3.md',
    description: 'Master Xiaohongshu\'s five push mechanisms: immediate, delayed, hot content, search, and recommendation systems for AI app promotion.',
    keywords: ['promote app in China distribution', 'market your app in China mechanisms', 'launch app in Chinese market push', 'Xiaohongshu marketing optimization', 'Redverse distribution guide', 'app localization China', 'Chinese social media promotion']
  },
  'advanced-strategies': {
    title: 'Advanced Strategies',
    subtitle: 'Scale Your Content Impact',
    category: 'Growth Tactics',
    estimatedTime: '5 min read',
    order: 4,
    markdownFile: 'part4.md',
    description: 'Advanced AI app marketing strategies for Xiaohongshu: decentralized promotion, paid campaigns, and scaling viral content in China.',
    keywords: ['promote app in China advanced', 'market your app in China strategies', 'launch app in Chinese market scaling', 'Xiaohongshu marketing advanced', 'Redverse advanced guide', 'app localization China', 'Chinese social media promotion']
  }
};

// Function to read markdown content from file
async function getMarkdownContent(filename: string): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'xiaohongshu-algorithm', filename);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return '';
  }
}

// Helper functions for navigation
function getPrevGuideSlug(currentOrder: number): string {
  const prevOrder = currentOrder - 1;
  const prevGuide = Object.entries(guidesConfig).find(([, config]) => config.order === prevOrder);
  return prevGuide ? prevGuide[0] : '';
}

function getNextGuideSlug(currentOrder: number): string {
  const nextOrder = currentOrder + 1;
  const nextGuide = Object.entries(guidesConfig).find(([, config]) => config.order === nextOrder);
  return nextGuide ? nextGuide[0] : '';
}

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  
  // Try to get article from database first
  const article = await getArticleBySlug(slug);
  let guide = null;
  let content = '';
  
  if (article) {
    // Article found in database
    content = article.content;
    guide = {
      title: article.title,
      subtitle: '', // Can be extended later
      category: 'Guide',
      estimatedTime: `${Math.max(1, Math.ceil(article.content.length / 1000))} min read`,
      order: 1 // Default order
    };
  } else {
    // Fallback to static content
    guide = guidesConfig[slug as keyof typeof guidesConfig];
    if (!guide) {
      notFound();
    }
    content = await getMarkdownContent(guide.markdownFile);
  }
  
  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-24 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="max-w-5xl mx-auto">
          <Breadcrumb 
            items={[
              { label: 'Guides', href: '/guides' },
              { label: guide.title }
            ]} 
          />
        </div>

        {/* Guide Header */}
        <div className="mb-12 max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              <Tag className="w-4 h-4 mr-1" />
              {guide.category}
            </span>
            <span className="inline-flex items-center text-sm text-gray-700">
              <Clock className="w-4 h-4 mr-1" />
              {guide.estimatedTime}
            </span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-2">
            {guide.title}
          </h1>
          <p className="text-xl text-gray-800">
            {guide.subtitle}
          </p>
        </div>

        {/* Guide Content */}
        <div className="space-y-12">
          {/* Algorithm Flowchart for first article */}
          {slug === 'algorithm-deep-dive' && (
            <div className="max-w-5xl mx-auto">
              <AlgorithmFlowchart />
            </div>
          )}

          {/* Main Content - Centered with max-width for readability */}
          <div className="max-w-5xl mx-auto">
            <MarkdownRenderer content={content} />
          </div>

          {/* Interactive Components - Consistent width */}
          {slug === 'algorithm-deep-dive' && (
            <div className="max-w-5xl mx-auto">
              <CESCalculator />
            </div>
          )}

          {slug === 'traffic-sources-analysis' && (
            <div className="max-w-5xl mx-auto">
              <TrafficSourcesChart />
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200 max-w-5xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              {guide.order > 1 && (
                <Link 
                  href={`/guides/${getPrevGuideSlug(guide.order)}`}
                  className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Guide
                </Link>
              )}
            </div>
            <div>
              {guide.order < 4 && (
                <Link 
                  href={`/guides/${getNextGuideSlug(guide.order)}`}
                  className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Next Guide
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // Try to get article from database first
  const article = await getArticleBySlug(slug);
  let guide = null;
  let description = '';
  let keywords = ['promote app in China', 'market your app in China', 'launch app in Chinese market', 'Xiaohongshu marketing', 'Redverse', 'app localization China', 'Chinese social media promotion'];

  if (article) {
    guide = { title: article.title };
    description = article.content.substring(0, 160) + '...';
  } else {
    guide = guidesConfig[slug as keyof typeof guidesConfig];
    if (guide) {
      description = guide.description;
      keywords = guide.keywords;
    }
  }
  
  if (!guide) {
    return {
      title: 'Guide Not Found | Redverse',
      description: 'The requested guide could not be found.'
    };
  }

  const baseUrl = 'https://www.redverse.online';
  
  return {
    title: `${guide.title} | Redverse - AI App Marketing in China`,
    description: description,
    keywords: keywords,
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
      title: `${guide.title} | Redverse`,
      description: guide.description,
      url: `${baseUrl}/guides/${slug}`,
      siteName: 'Redverse',
      images: [
        {
          url: '/twitter.png',
          width: 1200,
          height: 630,
          alt: `${guide.title} - Redverse Guide`,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${guide.title} | Redverse`,
      description: guide.description,
      images: ['/twitter.png'],
      creator: '@redverse',
    },
    alternates: {
      canonical: `/guides/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  // Get articles from database
  const articles = await getAllArticles();
  const dbSlugs = articles.map(article => ({ slug: article.slug }));
  
  // Add static config slugs as fallback
  const staticSlugs = Object.keys(guidesConfig).map((slug) => ({ slug }));
  
  // Combine and deduplicate
  const allSlugs = [...dbSlugs, ...staticSlugs];
  const uniqueSlugs = allSlugs.filter((item, index, self) => 
    index === self.findIndex(t => t.slug === item.slug)
  );
  
  return uniqueSlugs;
}