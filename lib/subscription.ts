'use server';

import { supabase, SubscriptionPlan, UserSubscription } from '@/lib/supabase';

// Get user's current subscription
export async function getUserSubscription(userId: string): Promise<{
  success: boolean;
  subscription?: UserSubscription & { plan?: SubscriptionPlan };
  error?: string;
}> {
  try {
    // First get user subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (subError && subError.code !== 'PGRST116') {
      console.error('Failed to fetch user subscription:', subError);
      return {
        success: false,
        error: 'Failed to fetch subscription'
      };
    }

    if (!subscription) {
      return {
        success: true,
        subscription: undefined
      };
    }

    // Then get the plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', subscription.plan_name)
      .single();

    if (planError) {
      console.error('Failed to fetch subscription plan:', planError);
      return {
        success: false,
        error: 'Failed to fetch plan details'
      };
    }

    return {
      success: true,
      subscription: {
        ...subscription,
        plan: plan
      }
    };

  } catch (error) {
    console.error('Get user subscription error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}

// Create basic subscription for new user
export async function createBasicSubscription(userId: string): Promise<{
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_name: 'basic'
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create basic subscription:', error);
      return {
        success: false,
        error: 'Failed to create subscription'
      };
    }

    return {
      success: true,
      subscription
    };

  } catch (error) {
    console.error('Create basic subscription error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}

// Get user's application count
export async function getUserApplicationCount(userId: string): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
  try {
    const { count, error } = await supabase
      .from('application')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to count user applications:', error);
      return {
        success: false,
        error: 'Failed to count applications'
      };
    }

    return {
      success: true,
      count: count || 0
    };

  } catch (error) {
    console.error('Get user application count error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}

// Check if user can submit application
export async function checkApplicationLimit(userId: string): Promise<{
  success: boolean;
  canSubmit?: boolean;
  remainingCount?: number;
  subscription?: UserSubscription & { plan?: SubscriptionPlan };
  error?: string;
}> {
  try {
    // Get user subscription
    const subResult = await getUserSubscription(userId);
    if (!subResult.success) {
      return {
        success: false,
        error: subResult.error
      };
    }

    // If no subscription, create basic subscription
    let subscription = subResult.subscription;
    if (!subscription) {
      const createResult = await createBasicSubscription(userId);
      if (!createResult.success) {
        return {
          success: false,
          error: createResult.error
        };
      }

      // Get the newly created subscription with plan details
      const newSubResult = await getUserSubscription(userId);
      if (!newSubResult.success || !newSubResult.subscription) {
        return {
          success: false,
          error: 'Failed to fetch new subscription'
        };
      }
      subscription = newSubResult.subscription;
    }

    // Get user's current application count
    const countResult = await getUserApplicationCount(userId);
    if (!countResult.success) {
      return {
        success: false,
        error: countResult.error
      };
    }

    const currentCount = countResult.count || 0;
    const maxApplications = subscription.plan?.max_applications;

    // If max_applications is null or undefined (unlimited), user can always submit
    if (maxApplications === null || maxApplications === undefined) {
      return {
        success: true,
        canSubmit: true,
        remainingCount: -1, // -1 indicates unlimited
        subscription
      };
    }

    // Check if user has reached the limit
    const canSubmit = currentCount < maxApplications;
    const remainingCount = Math.max(0, maxApplications - currentCount);

    return {
      success: true,
      canSubmit,
      remainingCount,
      subscription
    };

  } catch (error) {
    console.error('Check application limit error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}

// Get subscription plan details
export async function getSubscriptionPlan(planName: string): Promise<{
  success: boolean;
  plan?: SubscriptionPlan;
  error?: string;
}> {
  try {
    const { data: plan, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', planName)
      .single();

    if (error) {
      console.error('Failed to fetch subscription plan:', error);
      return {
        success: false,
        error: 'Failed to fetch plan'
      };
    }

    return {
      success: true,
      plan
    };

  } catch (error) {
    console.error('Get subscription plan error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}

// Upgrade user subscription to pro
export async function upgradeSubscription(userId: string): Promise<{
  success: boolean;
  subscription?: UserSubscription;
  error?: string;
}> {
  try {
    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .update({
        plan_name: 'pro'
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to upgrade subscription:', error);
      return {
        success: false,
        error: 'Failed to upgrade subscription'
      };
    }

    return {
      success: true,
      subscription
    };

  } catch (error) {
    console.error('Upgrade subscription error:', error);
    return {
      success: false,
      error: 'Something went wrong'
    };
  }
}