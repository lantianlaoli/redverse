import { Metadata } from 'next';
import { Footer } from "@/components/footer";
import { Pricing } from "@/components/pricing";

export const metadata: Metadata = {
  title: "Price - Affordable Plans for Global AI Developers | Redverse",
  description: "Choose the perfect plan to launch your AI app on Xiaohongshu. Start free or upgrade for unlimited submissions and premium features.",
  keywords: ["redverse pricing", "xiaohongshu marketing cost", "AI app promotion price", "china market entry cost"],
  openGraph: {
    title: "Price - Affordable Plans for Global AI Developers",
    description: "Choose the perfect plan to launch your AI app on Xiaohongshu. Start free or upgrade for unlimited submissions and premium features.",
  },
};

export default function PricePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Price Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Price
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the perfect plan to launch your AI app on Xiaohongshu and reach millions of Chinese users
          </p>
        </div>
        
        {/* Pricing Component */}
        <Pricing />

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What&apos;s included in the free plan?</h3>
              <p className="text-gray-600">
                You get one free application submission with personalized feedback and a professional Xiaohongshu marketing post created by our expert curator.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How quickly will my product be promoted?</h3>
              <p className="text-gray-600">
                We typically review and publish your Xiaohongshu post within 5 hours of submission, much faster than traditional marketing agencies.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I track my post&apos;s performance?</h3>
              <p className="text-gray-600">
                Yes! We provide detailed analytics including likes, saves, comments, shares, and views. You can track your performance through our dashboard.
              </p>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my product doesn&apos;t fit Xiaohongshu?</h3>
              <p className="text-gray-600">
                We&apos;ll provide honest feedback during our review process. Our curator will explain why certain products work better on Xiaohongshu and suggest improvements.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600">
                Yes, you can change your plan anytime. Upgrades take effect immediately, and downgrades will apply at your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}