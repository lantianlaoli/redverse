'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { ScrollAnimation } from '@/components/scroll-animation';
import { getUserApplications } from '@/lib/actions';
import { Application, Note, UserSubscription, SubscriptionPlan } from '@/lib/supabase';
import { getUserSubscription, getUserApplicationCount, createBasicSubscription } from '@/lib/subscription';
import { TrendingUpIcon, HeartIcon, BookmarkIcon, MessageCircleIcon, TwitterIcon } from '@/components/icons';

interface ApplicationItem extends Application {
  note?: Note; // Single note object, not array
  total_engagement: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<(UserSubscription & { plan?: SubscriptionPlan }) | null>(null);
  const [applicationCount, setApplicationCount] = useState<number>(0);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Check if application is under review (missing admin-filled fields)
  const isApplicationUnderReview = (app: ApplicationItem): boolean => {
    return !app.founder_url || !app.image || !app.explain;
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
      fetchSubscriptionData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getUserApplications();
      
      if (result.success && result.applications) {
        setApplications(result.applications);
      } else {
        setError(result.error || 'Failed to fetch applications');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubscriptionData = async () => {
    if (!user?.id) return;
    
    try {
      setSubscriptionLoading(true);
      
      // First try to get existing subscription
      const subResult = await getUserSubscription(user.id);
      let subscription = subResult.subscription;
      
      // If no subscription exists, create a basic one
      if (subResult.success && !subscription) {
        console.log('No subscription found for user, creating basic subscription');
        const createResult = await createBasicSubscription(user.id);
        
        if (createResult.success) {
          // Fetch the newly created subscription with plan details
          const newSubResult = await getUserSubscription(user.id);
          if (newSubResult.success) {
            subscription = newSubResult.subscription;
          }
        }
      }
      
      // Get application count
      const countResult = await getUserApplicationCount(user.id);
      
      // Update state
      if (subResult.success || subscription) {
        setSubscription(subscription || null);
      }
      
      if (countResult.success) {
        setApplicationCount(countResult.count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  };


  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to view your applications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">Manage your submitted AI applications</p>
        </div>

        {/* Subscription Status Card */}
        {subscriptionLoading ? (
          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
            <p className="text-gray-500">Loading subscription info...</p>
          </div>
        ) : (
          <div className={`rounded-xl p-6 mb-8 border ${
            subscription?.plan_name === 'pro' 
              ? 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {subscription?.plan_name === 'pro' ? '🚀 Pro Plan' : '🆓 Basic Plan'}
                </h2>
                <div className="space-y-1">
                  {subscription?.plan?.max_applications === null ? (
                    <p className="text-gray-700">
                      <span className="font-medium">Applications:</span> Unlimited submissions
                    </p>
                  ) : (
                    <p className="text-gray-700">
                      <span className="font-medium">Applications:</span> {applicationCount} / {subscription?.plan?.max_applications || 1} used
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{subscription?.status || 'Active'}</span>
                  </p>
                </div>
              </div>
              
              {subscription?.plan_name !== 'pro' && (
                <div className="text-right">
                  {/* Check if pro plan is enabled */}
                  <button 
                    className="inline-flex items-center px-4 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg cursor-not-allowed"
                    disabled
                  >
                    🚧 Pro Coming Soon
                  </button>
                  <p className="text-xs text-gray-600 mt-1">
                    Unlimited submissions
                  </p>
                </div>
              )}
            </div>
            
            {/* Progress bar for basic plan */}
            {subscription?.plan?.max_applications !== null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Usage</span>
                  <span>{applicationCount} / {subscription?.plan?.max_applications || 1}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (applicationCount / (subscription?.plan?.max_applications || 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchApplications}
              className="text-sm text-red-700 hover:text-red-900 underline"
            >
              Try again
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t submitted any applications yet.</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800"
            >
              Submit Your First Application
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((item, index) => {
              const isUnderReview = isApplicationUnderReview(item);
              
              return (
                <ScrollAnimation key={item.id} animation="fadeInUp" delay={index * 100}>
                  <div className={`rounded-xl p-6 transition-all duration-300 ${
                    isUnderReview 
                      ? 'bg-gray-50 border border-gray-300 hover:shadow-md' 
                      : 'bg-white border border-gray-200 hover:shadow-xl hover-lift'
                  }`}>
                    {isUnderReview ? (
                      // Simplified UI for applications under review
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Simple icon instead of ranking */}
                          <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                            <span className="text-orange-600 text-lg">📋</span>
                          </div>
                          
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h3>
                            <div className="text-sm text-gray-500">
                              Submitted: {new Date(item.created_at).toLocaleDateString('en-US')}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            📋 Under Review
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            We&apos;re processing your submission
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Full UI for published applications
                      <div className="flex items-start space-x-6">
                        {/* Ranking and Thumbnail */}
                        <div className="flex-shrink-0 flex items-center space-x-4">
                          {/* Ranking Number */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                            'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* Product Thumbnail */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name || 'Product image'}
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Content and Progress Bars */}
                        <div className="flex-1 min-w-0">
                          {/* Product Info */}
                          <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                              {item.name}
                            </h3>
                            {item.founder_url && (
                              <div className="flex items-center space-x-2 mt-1">
                                <TwitterIcon className="w-4 h-4 text-blue-500" />
                                <a
                                  href={item.founder_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                                >
                                  Founder Profile
                                </a>
                              </div>
                            )}
                            <div className="text-sm text-gray-500 mt-1">
                              Submitted: {new Date(item.created_at).toLocaleDateString('en-US')}
                            </div>
                          </div>

                          {/* Progress Bars */}
                          {item.note && (
                            <div className="space-y-3">
                              {/* Total Engagement - Most Prominent */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                                    <span className="text-sm font-bold text-gray-900">Total Engagement</span>
                                  </div>
                                  <div className="text-3xl font-bold text-gray-900">
                                    {item.total_engagement.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Individual Metrics */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <HeartIcon className="w-4 h-4 text-red-500" />
                                      <span className="text-xs font-medium text-gray-700">Likes</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">
                                      {(item.note.likes_count || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <BookmarkIcon className="w-4 h-4 text-yellow-600" />
                                      <span className="text-xs font-medium text-gray-700">Saves</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">
                                      {(item.note.collects_count || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <MessageCircleIcon className="w-4 h-4 text-blue-500" />
                                      <span className="text-xs font-medium text-gray-700">Comments</span>
                                    </div>
                                    <span className="text-lg font-bold text-gray-900">
                                      {(item.note.comments_count || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {!item.note && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <p className="text-sm text-gray-500 text-center">
                                No engagement data available yet. Your app will appear on the leaderboard once published.
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {(item.url || item.note?.url) && (
                            <div className="mt-4 flex justify-end space-x-3">
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                  <span>View Project</span>
                                  <span>→</span>
                                </a>
                              )}
                              {item.note?.url && (
                                <a
                                  href={item.note?.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  <span>View Post</span>
                                  <span>→</span>
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollAnimation>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}