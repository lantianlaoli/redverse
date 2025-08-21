import { Metadata } from 'next';
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Tutorial - How to Launch Your AI App on Xiaohongshu | Redverse",
  description: "Watch our step-by-step tutorial on how to successfully launch your AI product on Xiaohongshu and reach millions of Chinese users.",
  keywords: ["Xiaohongshu tutorial", "AI app launch China", "Chinese market tutorial", "Redverse tutorial"],
  openGraph: {
    title: "Tutorial - Launch Your AI App on Xiaohongshu",
    description: "Watch our step-by-step tutorial on how to successfully launch your AI product on Xiaohongshu and reach millions of Chinese users.",
  },
};

export default function TutorialPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Tutorial Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Tutorial
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Watch how we transform your product into engaging Xiaohongshu content that resonates with Chinese users
          </p>
        </div>
        
        {/* Demo Video */}
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/ZV-y8iQdqRk?si=5UjnME8Ktg9AaGw8&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&controls=1"
              title="Redverse Tutorial - Launch your product on Xiaohongshu"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0"
            ></iframe>
          </div>
        </div>

        {/* Tutorial Steps */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Step-by-Step Guide</h2>
          
          <div className="grid gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Submit Your Product</h3>
                <p className="text-gray-600 leading-relaxed">
                  Share your product URL with us. We&apos;ll analyze your innovation and evaluate its potential for the Chinese market and Xiaohongshu platform.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">We Craft Your Post</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our expert curator personally reviews your submission, creates engaging Chinese content, and prepares your product for the local audience.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Go Viral on Xiaohongshu</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your product goes live on Xiaohongshu with optimized content designed to reach and engage millions of Chinese users for maximum impact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}