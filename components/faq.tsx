'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What Exactly is Redverse AI?",
    answer: "We're the smart \"wormhole\" connecting global AI innovations with China's top lifestyle platform, Xiaohongshu. We transform your AI product into viral content, helping you achieve explosive growth and brand recognition in the Chinese market."
  },
  {
    question: "What's the potential of your Xiaohongshu channel?",
    answer: "My Xiaohongshu channel, with 344 followers and 1855 likes & saves, demonstrates strong content appeal and genuine user engagement. On Xiaohongshu, high likes and saves are a powerful indicator of content resonance, showing that our audience finds immense value in the AI tools we feature. This robust, engaged base allows us to effectively introduce and amplify your AI innovation to a highly curious Chinese audience, building significant buzz and potential users for you."
  },
  {
    question: "Why Xiaohongshu for AI Apps?",
    answer: "Xiaohongshu is a massive and highly engaged platform in China, with over 300 million monthly active users and nearly 100 million daily active users as of 2025. It's especially popular among young, tech-savvy users who actively seek new tools and trends. This platform offers a unique opportunity for your AI app to gain explosive exposure, cultivate authentic word-of-mouth, and quickly find its target audience in China. It's the premier launchpad for virality and user growth."
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
        <div key={index} className="border border-gray-200 rounded-lg">
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
      ))}
    </div>
  );
}