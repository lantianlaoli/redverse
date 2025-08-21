'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { ScrollAnimation } from './scroll-animation';
import { getUserSubscription } from '@/lib/subscription';
import { supabase, SubscriptionPlan, UserSubscription } from '@/lib/supabase';

// Helper function to format features from database
const formatFeatures = (features: Record<string, unknown> | string[] | null): string[] => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'object') {
    // Handle jsonb object format - extract values or convert to array
    return Object.values(features).filter(v => typeof v === 'string') as string[];
  }
  return [];
};

export function Pricing() {
  const { user } = useUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<(UserSubscription & { plan?: SubscriptionPlan }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all plans to check their enable status
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

  // Filter enabled plans and arrange with Plus always in the center
  const filteredPlans = plans.filter(p => p.enable);
  const enabledPlans = (() => {
    const basicPlan = filteredPlans.find(p => p.plan_name.toLowerCase() === 'basic');
    const plusPlan = filteredPlans.find(p => p.plan_name.toLowerCase() === 'plus');
    const proPlan = filteredPlans.find(p => p.plan_name.toLowerCase() === 'pro');
    const otherPlans = filteredPlans.filter(p => !['basic', 'plus', 'pro'].includes(p.plan_name.toLowerCase()));
    
    // Always put Plus in the middle for prominence: Basic → Plus → Pro
    const orderedPlans = [];
    if (basicPlan) orderedPlans.push(basicPlan);
    if (plusPlan) orderedPlans.push(plusPlan);  // Plus always in middle position
    if (proPlan) orderedPlans.push(proPlan);
    orderedPlans.push(...otherPlans.sort((a, b) => a.price_monthly - b.price_monthly));
    
    // Debug: log the final order
    console.log('Plan ordering:', orderedPlans.map(p => p.plan_name));
    
    return orderedPlans;
  })();

  const handleUpgradeClick = async (planName: string) => {
    if (paymentLoading || !user?.id) return;
    
    const userEmail = user.emailAddresses?.[0]?.emailAddress;
    if (!userEmail) {
      alert('Unable to get user email. Please try again.');
      return;
    }
    
    setPaymentLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: userEmail,
          planName: planName
        })
      });

      const data = await response.json();
      
      if (data.success && data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      } else {
        alert(data.error || 'Failed to create payment session. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };
  return (
    <div>

      <div className={`grid gap-8 max-w-6xl mx-auto items-center ${
        enabledPlans.length === 1 ? 'grid-cols-1 max-w-md' :
        enabledPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {enabledPlans.map((plan, index) => {
          const isRecommended = plan.plan_name.toLowerCase() === 'plus';
          const isCurrentPlan = user && userSubscription?.plan_name === plan.plan_name;
          
          // Debug: log each plan
          console.log(`Plan ${plan.plan_name}:`, {
            isRecommended,
            isCurrentPlan,
            index
          });
          
          // Define plan hierarchy (higher number = higher tier)
          const planHierarchy = { basic: 1, plus: 2, pro: 3 };
          const currentPlanTier = userSubscription?.plan_name ? planHierarchy[userSubscription.plan_name.toLowerCase() as keyof typeof planHierarchy] || 0 : 0;
          const targetPlanTier = planHierarchy[plan.plan_name.toLowerCase() as keyof typeof planHierarchy] || 0;
          const isUpgrade = targetPlanTier > currentPlanTier;
          const isDowngrade = targetPlanTier < currentPlanTier;
          
          // Debug info (will be removed later)
          if (plan.plan_name.toLowerCase() === 'plus') {
            console.log('Plus plan debug:', {
              currentPlan: userSubscription?.plan_name,
              currentPlanTier,
              targetPlanTier,
              isUpgrade,
              isDowngrade,
              isCurrentPlan
            });
          }
          
          return (
            <ScrollAnimation 
              key={plan.id} 
              animation={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"} 
              delay={100 + index * 100}
            >
              <div className={`relative bg-white rounded-xl h-full flex flex-col hover-lift transition-all duration-300 ${
                isRecommended 
                  ? 'border-4 border-black shadow-lg transform scale-105 p-10' 
                  : 'border border-gray-200 p-8'
              }`}>
                {isRecommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black text-white text-sm font-medium px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-8">
                  <h3 className={`font-medium text-gray-900 capitalize ${isRecommended ? 'text-xl' : 'text-lg'}`}>
                    {plan.plan_name}
                  </h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className={`font-bold text-gray-900 ${isRecommended ? 'text-6xl' : 'text-5xl'}`}>
                      {plan.price_monthly === 0 ? 'Free' : `$${plan.price_monthly}`}
                    </span>
                    {plan.price_monthly !== 0 && (
                      <span className={`text-gray-500 ${isRecommended ? 'text-2xl' : 'text-2xl'}`}>
                        {plan.is_one_time ? ' one-time' : '/m'}
                      </span>
                    )}
                  </div>
                </div>

                <ul className={`space-y-3 mb-8 text-gray-700 flex-grow ${isRecommended ? 'text-lg' : ''}`}>
                  {(() => {
                    const features = formatFeatures(plan.features || null);
                    return features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ));
                  })()}
                </ul>

                {/* Button based on user and plan status */}
                {!user ? (
                  <button className={`w-full bg-gray-300 text-gray-500 rounded-full font-medium cursor-not-allowed ${
                    isRecommended ? 'py-4 px-6 text-lg' : 'py-3 px-6'
                  }`}>
                    Sign in required
                  </button>
                ) : isCurrentPlan ? (
                  <button className={`w-full bg-green-600 text-white rounded-full font-medium cursor-default ${
                    isRecommended ? 'py-4 px-6 text-lg' : 'py-3 px-6'
                  }`}>
                    ✓ Current Plan
                  </button>
                ) : plan.price_monthly === 0 ? (
                  <div className={isRecommended ? 'py-4' : 'py-3'}></div>
                ) : isDowngrade ? (
                  <button className={`w-full bg-gray-400 text-white rounded-full font-medium cursor-default ${
                    isRecommended ? 'py-4 px-6 text-lg' : 'py-3 px-6'
                  }`}>
                    Lower Tier Plan
                  </button>
                ) : isUpgrade ? (
                  <button 
                    className={`w-full bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecommended ? 'py-4 px-6 text-lg' : 'py-3 px-6'
                    }`}
                    onClick={() => handleUpgradeClick(plan.plan_name)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing...' : `Upgrade to ${plan.plan_name.charAt(0).toUpperCase() + plan.plan_name.slice(1)}`}
                  </button>
                ) : (
                  <button 
                    className={`w-full bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRecommended ? 'py-4 px-6 text-lg' : 'py-3 px-6'
                    }`}
                    onClick={() => handleUpgradeClick(plan.plan_name)}
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? 'Processing...' : `Switch to ${plan.plan_name.charAt(0).toUpperCase() + plan.plan_name.slice(1)}`}
                  </button>
                )}
              </div>
            </ScrollAnimation>
          );
        })}
      </div>
    </div>
  );
}