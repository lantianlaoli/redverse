'use client';

import { Header } from "@/components/header";
import { SubmissionForm } from "@/components/submission-form";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SubmitPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/');
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-4xl px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-8">
          <button 
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Submit Your AI Application
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tell us about your AI innovation and we&apos;ll help transform it into viral content on Xiaohongshu.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <SubmissionForm onSuccess={() => router.push('/dashboard')} />
        </div>
      </main>
    </div>
  );
}