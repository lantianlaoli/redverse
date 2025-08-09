import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RedisStore } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, planName } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'User email is required' },
        { status: 400 }
      );
    }

    if (!planName) {
      return NextResponse.json(
        { success: false, error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // Get the plan details from database
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('plan_name', planName)
      .eq('enable', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { success: false, error: 'Plan not found or not available' },
        { status: 404 }
      );
    }

    // Get current environment mode from Redis
    const isDevMode = await RedisStore.getDevMode();
    const productId = isDevMode ? plan.creem_dev_product_id : plan.creem_product_id;
    
    if (!productId) {
      return NextResponse.json(
        { success: false, error: `Plan does not have a ${isDevMode ? 'development' : 'production'} product ID configured` },
        { status: 400 }
      );
    }

    // Select API configuration based on environment
    const apiUrl = isDevMode ? process.env.CREEM_DEV_API_URL : process.env.CREEM_API_URL;
    const apiKey = isDevMode ? process.env.CREEM_DEV_API_KEY : process.env.CREEM_API_KEY;

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { success: false, error: `${isDevMode ? 'Development' : 'Production'} Creem API configuration is missing` },
        { status: 500 }
      );
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'User-Agent': 'RedverseApp/1.0.0',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        customer: {
          email: userEmail
        },
        product_id: productId,
        metadata: {
          userId: userId,
          environment: isDevMode ? 'development' : 'production'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Creem API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      checkout_url: data.checkout_url,
      checkout_id: data.id
    });

  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout' },
      { status: 500 }
    );
  }
}