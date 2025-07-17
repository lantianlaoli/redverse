'use client';

import { Header } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/pricing";
import { ScrollAnimation } from "@/components/scroll-animation";
import { SignInButton, useUser } from '@clerk/nextjs';
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24">
        {/* Hero Section */}
        <div className="hero-section min-h-[calc(100vh-6rem)] flex flex-col justify-center text-center py-8 sm:py-12 md:py-16">
          {/* Profile Avatar and Status */}
          <div className="flex flex-col items-center mb-6 sm:mb-8 animate-fadeIn">
            <Image
              src="/me.jpg"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mb-3 animate-scaleIn w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20"
            />
            <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-2 sm:px-3 py-1 animate-fadeIn animate-delay-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-breathe"></div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">Available for new projects</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight animate-fadeInUp animate-delay-300 px-2">
            Bridge the AI Divide: Go Viral on{" "}
            <a 
              href="https://www.xiaohongshu.com/user/profile/646ced020000000011001e47" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline decoration-2 underline-offset-4 hover:text-gray-700 transition-colors"
            >
              Xiaohongshu
            </a>
          </h1>
          
          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 md:mb-12 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed animate-fadeInUp animate-delay-400 px-2">
            Submit Your Global AI Innovation. I&apos;ll Transform It Into China&apos;s Next Big Trend.
          </p>
          
          {/* Action Button */}
          <div className="flex justify-center mb-8 animate-fadeInUp animate-delay-500">
            {user ? (
              <Link href="/submit">
                <div className="button-hole">
                  <button className="bouncy-button">
                    <span className="button-text">Get Started</span>
                  </button>
                </div>
              </Link>
            ) : (
              <SignInButton mode="modal">
                <div className="button-hole">
                  <button className="bouncy-button">
                    <span className="button-text">Get Started</span>
                  </button>
                </div>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <ScrollAnimation>
          <div id="leaderboard" className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Leaderboard
              </h2>
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <span>The data is updated daily at 8:00 in the East Eighth District</span>
              
              </p>
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

        {/* How it works Section */}
        <ScrollAnimation>
          <div id="how-it-works" className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                How it works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Step 1 */}
              <ScrollAnimation animation="fadeInUp" delay={100}>
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                      01
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Submit your<br />AI product
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Share your AI innovation with us. We&apos;ll evaluate your product&apos;s potential for the Chinese market and Xiaohongshu platform.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>

            {/* Arrow 1 */}
            <div className="hidden md:block absolute top-20 left-1/3 transform -translate-x-1/2">
              <svg width="100" height="40" viewBox="0 0 100 40" className="text-gray-300">
                <path d="M10 20 Q50 10 90 20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M85 15 L90 20 L85 25" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Step 2 */}
            <ScrollAnimation animation="fadeInUp" delay={200}>
              <div className="text-center">
                <div className="mb-8">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                    02
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Review by<br />lantianlaoli
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our expert curator personally reviews your submission, crafts engaging content, and prepares your product for the Chinese audience.
                  </p>
                </div>
              </div>
            </ScrollAnimation>

            {/* Arrow 2 */}
            <div className="hidden md:block absolute top-20 right-1/3 transform translate-x-1/2">
              <svg width="100" height="40" viewBox="0 0 100 40" className="text-gray-300">
                <path d="M10 20 Q50 10 90 20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M85 15 L90 20 L85 25" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

              {/* Step 3 */}
              <ScrollAnimation animation="fadeInUp" delay={300}>
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 hover:scale-110 transition-transform duration-300">
                      03
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Published on<br />Xiaohongshu
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      Your product goes live on Xiaohongshu with optimized content designed to reach and engage millions of Chinese users.
                    </p>
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </ScrollAnimation>

        {/* FAQ Section */}
        <ScrollAnimation animation="fadeInUp">
          <div id="questions" className="py-16 border-t border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Questions
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
