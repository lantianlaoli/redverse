'use client';

import { Header } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/pricing";
import { ScrollAnimation } from "@/components/scroll-animation";
import { QuickSubmit } from "@/components/quick-submit";
import Image from "next/image";

export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
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
                  alt="Profile"
                  width={60}
                  height={60}
                  className="rounded-full mb-3 lg:mb-0 lg:mr-4 animate-scaleIn"
                />
                <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1 animate-fadeIn animate-delay-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-breathe"></div>
                  <span className="text-sm font-medium text-gray-700">Available for new projects</span>
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight animate-fadeInUp animate-delay-300">
              🚀Launch your indie product to China&apos;s visual discovery engine
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg lg:text-xl text-gray-600 leading-relaxed animate-fadeInUp animate-delay-400 max-w-lg mx-auto lg:mx-0">
                Beam your project into{" "}
                <a 
                  href="https://www.xiaohongshu.com/explore" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline decoration-2 underline-offset-4 hover:text-gray-800 transition-colors"
                >
                  Xiaohongshu
                </a>
                {" "}— a visual planet where aesthetic-first ideas go viral.
              </p>
              
              {/* Action Button */}
              <div className="animate-fadeInUp animate-delay-500">
                <QuickSubmit />
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
                      src="/note_capture_1.png"
                      alt="Xiaohongshu Note Example - Click to view live"
                      width={500}
                      height={750}
                      className="w-full h-auto"
                    />
                  </div>
                </a>
                
                {/* Live indicator */}
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
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

        {/* Social Proof Section */}
        <ScrollAnimation>
          <div id="social-proof" className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Success Stories
              </h2>
            </div>
            
            <Leaderboard />
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
