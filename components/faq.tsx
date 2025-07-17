'use client';

import { useState } from 'react';
import { ScrollAnimation } from './scroll-animation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does Redverse work?",
    answer: "Simple 3-step process: (1) Submit your AI product details and website URL through our form, (2) I personally review your application and create engaging Chinese content optimized for Xiaohongshu's audience, (3) Your product gets featured on my Xiaohongshu channel with professional content designed to drive traffic and user acquisition."
  },
  {
    question: "What kind of AI products do you accept?",
    answer: "I accept all types of AI applications including productivity tools, creative platforms, development utilities, chatbots, image generators, and automation software. Your product should be functional, accessible via web, and offer clear value to users. Both free and paid products are welcome."
  },
  {
    question: "How long does the review process take?",
    answer: "Most applications are reviewed within 24-48 hours. If approved, content creation and posting typically happens within 3-5 business days. You'll receive email notifications at each stage and can track your application status in your dashboard."
  },
  {
    question: "What are the costs involved?",
    answer: "Check our pricing section for current rates. We offer different packages based on content complexity and promotion scope. Payment is only required after your application is approved and before content goes live. No upfront fees or hidden costs."
  },
  {
    question: "What results can I expect?",
    answer: "Results vary by product and market fit, but featured projects typically see significant traffic increases and user signups from China. You can view real performance data of previous projects on our leaderboard, including engagement metrics and click-through rates."
  },
  {
    question: "How do I track my application status?",
    answer: "After submission, you'll receive a confirmation email and can monitor your application status in your personal dashboard. You'll get notifications when your application is reviewed, approved, content is created, and when it goes live on Xiaohongshu."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-4">
      {faqData.map((item, index) => (
        <ScrollAnimation key={index} animation="fadeInUp" delay={index * 100}>
          <div className="border border-gray-200 rounded-lg hover-lift transition-all duration-300">
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <span className="font-medium text-gray-900">{item.question}</span>
            <span className="text-gray-500 text-xl">
              {openIndex === index ? '−' : '+'}
            </span>
          </button>
          <div 
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-6 pb-4">
              <p className="text-gray-600 leading-relaxed">{item.answer}</p>
            </div>
          </div>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  );
}