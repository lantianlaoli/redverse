'use client';

import { useState } from 'react';
import { ScrollAnimation } from './scroll-animation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What exactly does Redverse do?",
    answer: "Redverse helps you promote your app or product on Xiaohongshu (Little Red Book), one of the most popular platforms among Chinese users. We create and publish native-style posts that generate attention and feedback from real users."
  },
  {
    question: "Do I need to understand Chinese or create content myself?",
    answer: "No. You don't need to speak Chinese or write anything. We handle all content creation, localization, and publishing under a trusted Xiaohongshu account."
  },
  {
    question: "Is this allowed by Xiaohongshu? Will it look like an ad?",
    answer: "We follow native content guidelines and don't use ad tags. Every post is written like a personal recommendation, based on your product's actual features."
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