import { Header } from "@/components/header";
import { SubmissionForm } from "@/components/submission-form";
import { Leaderboard } from "@/components/leaderboard";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Make Your AI App Go Viral in China
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Bridge global AI innovation with the Chinese market. We help transform cutting-edge AI into viral Xiaohongshu posts, reaching millions of Chinese users and expanding your market for free!
          </p>
          
          {/* Submission Form */}
          <div className="mb-16">
            <SubmissionForm />
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="py-16 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Top AI Apps on Xiaohongshu
            </h2>
            <p className="text-gray-600">
              See which AI applications are most popular on Xiaohongshu
            </p>
          </div>
          
          <Leaderboard />
        </div>
      </main>
    </div>
  );
}
