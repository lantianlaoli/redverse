'use client';

import { ScrollAnimation } from './scroll-animation';

export function Pricing() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Pricing
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
        {/* Basic Plan */}
        <ScrollAnimation animation="fadeInLeft" delay={100}>
          <div className="relative bg-white border border-gray-200 rounded-xl p-8 h-full flex flex-col hover-lift transition-all duration-300">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-lg font-medium text-gray-900">Basic</h3>
            <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
              Available
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">Free</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Perfect for getting started with your first AI project on Xiaohongshu.
          </p>

          <ul className="space-y-3 mb-8 text-gray-700 flex-grow">
            <li>• 1 project submission per Twitter account</li>
            <li>• Professional content creation</li>
            <li>• Xiaohongshu publication</li>
            <li>• Community support</li>
          </ul>

          <button className="w-full bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 button-hover">
            Subscribe
          </button>
          </div>
        </ScrollAnimation>

        {/* Premium Plan - Larger with emphasis */}
        <ScrollAnimation animation="fadeInRight" delay={200}>
          <div className="relative bg-white border-4 border-black rounded-xl p-10 shadow-lg transform scale-105 h-full flex flex-col hover-lift transition-all duration-300">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
            Recommended
          </div>
          
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-medium text-gray-900">Premium</h3>
            <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-6xl font-bold text-gray-900">$9.9</span>
              <span className="text-gray-500 text-2xl">/m</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Perfect for scaling your AI products and maximizing reach on Xiaohongshu.
          </p>

          <ul className="space-y-3 mb-8 text-gray-700 text-lg flex-grow">
            <li>• Up to 4 project submissions per month</li>
            <li>• Priority review and publishing</li>
            <li>• Enhanced content optimization</li>
            <li>• Direct communication with curator</li>
            <li>• Performance analytics</li>
          </ul>

          <button className="w-full bg-black text-white py-4 px-6 rounded-full font-medium text-lg opacity-50 cursor-not-allowed transition-all duration-300" disabled>
            Subscribe
          </button>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}