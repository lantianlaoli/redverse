import { Header } from "@/components/header";
import { Leaderboard } from "@/components/leaderboard";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-7xl px-8">
        {/* Hero Section */}
        <div className="py-16 text-center">
          {/* Profile Avatar and Status */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/me.jpg"
              alt="Profile"
              width={80}
              height={80}
              className="rounded-full mb-3"
            />
            <div className="flex items-center space-x-2 border border-gray-200 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-breathe"></div>
              <span className="text-sm font-medium text-gray-700">Available for new projects</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Bridge the AI Divide: Go Viral on{" "}
            <span className="underline decoration-2 underline-offset-4">Xiaohongshu</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Submit Your Global AI Innovation. I&apos;ll Transform It Into China&apos;s Next Big Trend.
          </p>
          
          {/* Action Button */}
          <div className="flex justify-center mb-8">
            <Link href="/submit">
              <button className="rounded-full bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-800 transition-colors">
                Get Started
              </button>
            </Link>
          </div>
        </div>


        {/* How it works Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
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

            {/* Arrow 1 */}
            <div className="hidden md:block absolute top-20 left-1/3 transform -translate-x-1/2">
              <svg width="100" height="40" viewBox="0 0 100 40" className="text-gray-300">
                <path d="M10 20 Q50 10 90 20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M85 15 L90 20 L85 25" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
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

            {/* Arrow 2 */}
            <div className="hidden md:block absolute top-20 right-1/3 transform translate-x-1/2">
              <svg width="100" height="40" viewBox="0 0 100 40" className="text-gray-300">
                <path d="M10 20 Q50 10 90 20" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M85 15 L90 20 L85 25" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-8">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
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
          </div>
        </div>

        {/* Leaderboard Section */}
        <div id="leaderboard" className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Leaderboard
            </h2>
          </div>
          
          <Leaderboard />
        </div>

        {/* FAQ Section */}
        <div className="py-16 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Questions
            </h2>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <FAQ />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
