import { Metadata } from 'next';
import { Leaderboard } from "@/components/leaderboard";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/pricing";
import { ScrollAnimation } from "@/components/scroll-animation";
import { QuickSubmit } from "@/components/quick-submit";
import { TrustedBy } from "@/components/trusted-by";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Redverse - Make Your AI App Go Viral in China | Home",
  description: "Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users. Bridge global AI innovation with the Chinese market through our powerful marketing platform.",
  keywords: ["AI app marketing", "Xiaohongshu viral content", "Chinese market penetration", "AI product launch", "social media marketing China", "RedBook promotion"],
  openGraph: {
    title: "Redverse - Make Your AI App Go Viral in China",
    description: "Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users. Bridge global AI innovation with the Chinese market.",
    url: 'https://www.redverse.online/',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Redverse - AI App Marketing Platform Homepage',
      },
    ],
  },
  twitter: {
    title: "Redverse - Make Your AI App Go Viral in China",
    description: "Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users. Bridge global AI innovation with the Chinese market.",
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Redverse - Make Your AI App Go Viral in China",
    "description": "Transform your AI app into viral Xiaohongshu posts and reach millions of Chinese users. Bridge global AI innovation with the Chinese market.",
    "url": "https://www.redverse.online",
    "mainEntity": {
      "@type": "SoftwareApplication",
      "name": "Redverse",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "category": "Marketing Platform",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "150"
      },
      "featureList": [
        "AI-powered Xiaohongshu content generation",
        "Chinese market targeting",
        "Viral marketing optimization",
        "Social media automation"
      ]
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
        {/* Hero Section */}
        <div className="hero-section min-h-[calc(100vh-6rem)] py-8 sm:py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Content */}
            <div className="text-center lg:text-left space-y-6">
              {/* Profile Avatar and Status */}
              <div className="flex flex-col lg:flex-row lg:items-center items-center lg:justify-start justify-center mb-6 animate-fadeIn">
                <Image
                  src="/me.jpg"
                  alt="Redverse founder profile picture - AI app marketing expert"
                  width={60}
                  height={60}
                  className="rounded-full mb-3 lg:mb-0 lg:mr-4 animate-scaleIn"
                />
                <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1 animate-fadeIn animate-delay-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-breathe"></div>
                  <span className="text-sm font-medium text-gray-700">Available for new product</span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold font-mono text-gray-900 leading-tight animate-fadeInUp animate-delay-300">
              🚀Launch your indie product to China&apos;s visual discovery engine
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg lg:text-xl font-serif text-gray-600 leading-relaxed animate-fadeInUp animate-delay-400 max-w-lg mx-auto lg:mx-0">
                Beam your project into{" "}
                <a 
                  href="https://www.xiaohongshu.com/explore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline decoration-2 underline-offset-4 hover:text-gray-800 transition-colors"
                >
                  Xiaohongshu
                </a>
                {" "}— boasting over 300 million monthly active users.
              </p>
              
              {/* Guide Button */}
              <div className="animate-fadeInUp animate-delay-400 mb-4">
                <div className="w-full max-w-2xl mx-auto">
                  <Link
                    href="/guides"
                    className="guide-button group w-full flex items-center justify-center bg-white border-2 border-gray-200 hover:border-gray-300 rounded-full shadow-lg px-8 py-3 min-h-[60px] transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-gray-800 transition-colors flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <span className="text-base sm:text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors text-center">
                        Explore Xiaohongshu Algorithm
                      </span>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all flex-shrink-0">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Action Button */}
              <div className="animate-fadeInUp animate-delay-500">
                <QuickSubmit />
              </div>

              {/* Trusted By Section */}
              <div className="animate-fadeInUp animate-delay-600">
                <TrustedBy />
              </div>
            </div>

            {/* Right Side - Xiaohongshu Note Preview */}
            <div className="flex justify-center lg:justify-end animate-fadeInUp animate-delay-600">
              <div className="relative">
                {/* Browser mockup frame */}
                <a 
                  href="https://www.xiaohongshu.com/explore/6860b25d000000002203f08d?xsec_token=AB2ZSF4APvcvQlhpvQQsQMaGk6kNIMmQXIXYc56A-XuOI=&xsec_source=pc_user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-100 rounded-t-lg p-4 shadow-2xl transform rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  {/* Browser controls */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-white rounded text-xs text-gray-500 px-3 py-1 ml-3">
                      xiaohongshu.com
                    </div>
                  </div>
                  
                  {/* Note screenshot */}
                  <div className="rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src="https://mzewkidgqgxygyciyvbl.supabase.co/storage/v1/object/public/images/hero_demo/repowarp.png"
                      alt="Successful Xiaohongshu viral post example generated by Redverse AI marketing platform"
                      width={600}
                      height={900}
                      className="w-full h-auto"
                    />
                  </div>
                </a>
                
                {/* Live indicator */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg">
                  Live Example
                </div>
                
                {/* Click hint */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Click to view on Xiaohongshu
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <ScrollAnimation>
          <div id="how-it-works" className="py-20 border-t border-gray-200">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                How it works
              </h2>
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                Want to understand the full strategy behind Xiaohongshu marketing? 
                <Link href="/guides" className="text-gray-900 underline hover:text-gray-700 ml-1">
                  Read our complete guide
                </Link>
              </p>
            </div>

            {/* Steps with curved arrows */}
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
                {/* Step 1 */}
                <ScrollAnimation animation="fadeInUp" delay={100}>
                  <div className="text-center relative">
                    <div className="mb-8">
                      <div className="text-6xl md:text-7xl font-light text-gray-300 mb-6">01</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Submit your product
                      </h3>
                      <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Share your product URL with us. We&apos;ll analyze your innovation and evaluate its potential for the Chinese market and Xiaohongshu platform.
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>

                {/* Curved Arrow 1 */}
                <div className="hidden md:block absolute top-16 left-1/3 transform -translate-x-1/2 z-10">
                  <svg width="120" height="60" viewBox="0 0 120 60" className="text-gray-300">
                    <path d="M10 30 Q60 5 110 30" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                    <path d="M105 25 L110 30 L105 35" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Step 2 */}
                <ScrollAnimation animation="fadeInUp" delay={200}>
                  <div className="text-center relative">
                    <div className="mb-8">
                      <div className="text-6xl md:text-7xl font-light text-gray-300 mb-6">02</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        We craft your post
                      </h3>
                      <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Our expert curator personally reviews your submission, creates engaging Chinese content, and prepares your product for the local audience.
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>

                {/* Curved Arrow 2 */}
                <div className="hidden md:block absolute top-16 right-1/3 transform translate-x-1/2 z-10">
                  <svg width="120" height="60" viewBox="0 0 120 60" className="text-gray-300">
                    <path d="M10 30 Q60 5 110 30" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                    <path d="M105 25 L110 30 L105 35" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </div>

                {/* Step 3 */}
                <ScrollAnimation animation="fadeInUp" delay={300}>
                  <div className="text-center relative">
                    <div className="mb-8">
                      <div className="text-6xl md:text-7xl font-light text-gray-300 mb-6">03</div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                        Go viral on Xiaohongshu
                      </h3>
                      <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                        Your product goes live on Xiaohongshu with optimized content designed to reach and engage millions of Chinese users for maximum impact.
                      </p>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Leaderboard Section */}
        <ScrollAnimation>
          <div id="leaderboard" className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Leaderboard
              </h2>
            </div>
            
            <Leaderboard limit={3} />
            
            {/* View Full Leaderboard Link */}
            <div className="text-center mt-8">
              <Link
                href="/leaderboard"
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-full text-base font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
              >
                View Full Leaderboard
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Pricing Section */}
        <ScrollAnimation animation="fadeIn">
          <div id="pricing" className="py-16 border-t border-gray-200">
            <Pricing />
          </div>
        </ScrollAnimation>

        {/* FAQ Section */}
        <ScrollAnimation animation="fadeInUp">
          <div id="questions" className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Q&A
              </h2>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <FAQ />
            </div>
          </div>
        </ScrollAnimation>
      </main>

      <Footer />
    </div>
  );
}
