'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ScrollAnimation } from './scroll-animation';
import { getUserSubscription } from '@/lib/subscription';
import { supabase, SubscriptionPlan, UserSubscription } from '@/lib/supabase';

export function Pricing() {
  const { user } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<(UserSubscription & { plan?: SubscriptionPlan }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price_monthly', { ascending: true });

        if (!plansError && plansData) {
          setPlans(plansData);
        }

        // Get user subscription if logged in
        if (user?.id) {
          const subResult = await getUserSubscription(user.id);
          if (subResult.success) {
            setUserSubscription(subResult.subscription || null);
          }
        }
      } catch (error) {
        console.error('Failed to fetch pricing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading pricing...</p>
      </div>
    );
  }

  const basicPlan = plans.find(p => p.plan_name === 'basic');
  const proPlan = plans.find(p => p.plan_name === 'pro');
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
              {basicPlan?.enable ? 'Available' : 'Available'}
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-5xl font-bold text-gray-900">
                {basicPlan?.price_monthly === 0 ? 'Free' : `$${basicPlan?.price_monthly}`}
              </span>
              {basicPlan?.price_monthly !== 0 && (
                <span className="text-gray-500 text-2xl">/m</span>
              )}
            </div>
          </div>

          <p className="text-gray-600 mb-8">
            Perfect for getting started with your first AI project on Xiaohongshu.
          </p>

          <ul className="space-y-3 mb-8 text-gray-700 flex-grow">
            <li>• {basicPlan?.max_applications || 1} project submission</li>
            <li>• Professional content creation</li>
            <li>• Xiaohongshu publication</li>
            <li>• Community support</li>
          </ul>

          {/* Different button states based on user subscription */}
          {!user ? (
            <button className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-full font-medium cursor-not-allowed">
              Sign in to get started
            </button>
          ) : userSubscription?.plan_name === 'basic' ? (
            <button className="w-full bg-green-600 text-white py-3 px-6 rounded-full font-medium cursor-default">
              ✓ Current Plan
            </button>
          ) : (
            <button className="w-full bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 button-hover">
              Get Started
            </button>
          )}
          </div>
        </ScrollAnimation>

        {/* Pro Plan - Larger with emphasis */}
        <ScrollAnimation animation="fadeInRight" delay={200}>
          <div className="relative bg-white border-4 border-black rounded-xl p-10 shadow-lg transform scale-105 h-full flex flex-col hover-lift transition-all duration-300">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
            Recommended
          </div>
          
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-xl font-medium text-gray-900">Pro</h3>
            <span className="bg-gray-500 text-white text-xs font-medium px-3 py-1 rounded-full">
              {proPlan?.enable ? 'Available' : 'Coming Soon'}
            </span>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-6xl font-bold text-gray-900">
                ${proPlan?.price_monthly || '29.99'}
              </span>
              <span className="text-gray-500 text-2xl">/m</span>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            Perfect for scaling your AI products and maximizing reach on Xiaohongshu.
          </p>

          <ul className="space-y-3 mb-8 text-gray-700 text-lg flex-grow">
            <li>• {proPlan?.max_applications ? `Up to ${proPlan.max_applications} project submissions per month` : 'Unlimited project submissions'}</li>
            <li>• Priority review and publishing</li>
            <li>• Enhanced content optimization</li>
            <li>• Direct communication with curator</li>
            <li>• Performance analytics</li>
          </ul>

          {/* Different button states based on plan availability and user subscription */}
          {!user ? (
            <button className="w-full bg-gray-300 text-gray-500 py-4 px-6 rounded-full font-medium text-lg cursor-not-allowed">
              Sign in required
            </button>
          ) : userSubscription?.plan_name === 'pro' ? (
            <button className="w-full bg-green-600 text-white py-4 px-6 rounded-full font-medium text-lg cursor-default">
              ✓ Current Plan
            </button>
          ) : !proPlan?.enable ? (
            <button className="w-full bg-gray-400 text-white py-4 px-6 rounded-full font-medium text-lg cursor-not-allowed" disabled>
              🚧 Coming Soon
            </button>
          ) : (
            <button className="w-full bg-black text-white py-4 px-6 rounded-full font-medium text-lg hover:bg-gray-800 transition-all duration-300 hover:scale-105">
              Upgrade to Pro
            </button>
          )}
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}