import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('Creem webhook received:', JSON.stringify(payload, null, 2));

    // Extract data from webhook payload
    const { object, eventType } = payload;
    console.log(`Processing event: ${eventType}`);
    
    let userId, subscriptionId, status, productId;
    
    if (eventType === 'checkout.completed') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _checkoutId, status: checkoutStatus, metadata, subscription } = object;
      userId = metadata?.userId;
      subscriptionId = subscription?.id;
      status = checkoutStatus;
      // Extract product_id from nested structure
      productId = object.product?.id || object.order?.product;
    } else if (eventType === 'subscription.canceled') {
      const { metadata, id: subId, status: subStatus } = object;
      userId = metadata?.userId || metadata?.internal_customer_id;
      subscriptionId = subId;
      status = subStatus;
      // For subscription events, product_id might be in different location
      productId = object.product?.id || object.product;
    } else {
      console.log(`Unsupported event type: ${eventType}`);
      return NextResponse.json({ success: true, message: 'Event type not handled' });
    }

    if (!userId) {
      console.error('No userId found in webhook metadata');
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
    }

    // Environment configuration available if needed
    // const isDevMode = process.env.CREEM_ENVIRONMENT === 'development';
    
    try {
      // Determine plan based on product_id
      let planName = 'basic'; // Default fallback
      
      if (eventType === 'checkout.completed' || eventType === 'subscription.active' || eventType === 'subscription.paid') {
        if (productId) {
          // Query subscription_plans to find which plan matches this product_id
          const { data: matchingPlan } = await supabase
            .from('subscription_plans')
            .select('plan_name')
            .or(`creem_product_id.eq.${productId},creem_dev_product_id.eq.${productId}`)
            .single();

          if (matchingPlan) {
            planName = matchingPlan.plan_name;
            console.log(`Found matching plan: ${planName} for product_id: ${productId}`);
          } else {
            console.warn(`⚠️ No matching plan found for product_id: ${productId}, defaulting to 'basic'`);
          }
        } else {
          console.warn(`⚠️ No product_id found in webhook payload, defaulting to 'basic'`);
        }

        // Check if user already has a subscription
        const { data: existingSubscription } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (existingSubscription) {
          // Update existing subscription
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({
              plan_name: planName,
              creem_id: subscriptionId
            })
            .eq('user_id', userId);

          if (updateError) {
            console.error('Failed to update subscription:', updateError);
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
          }
        } else {
          // Create new subscription
          const { error: insertError } = await supabase
            .from('user_subscriptions')
            .insert({
              user_id: userId,
              plan_name: planName,
              creem_id: subscriptionId
            });

          if (insertError) {
            console.error('Failed to create subscription:', insertError);
            return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
          }
        }

        console.log(`✅ Successfully updated user ${userId} to ${planName} plan (${eventType})`);
        return NextResponse.json({ success: true, message: `Subscription updated to ${planName} via ${eventType}` });
        
      } else if (eventType === 'subscription.canceled' || eventType === 'subscription.expired') {
        // Events that should downgrade user to basic plan
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_name: 'basic'
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to downgrade subscription:', updateError);
          return NextResponse.json({ error: 'Failed to downgrade subscription' }, { status: 500 });
        }

        console.log(`✅ Successfully downgraded user ${userId} to basic plan (${eventType})`);
        return NextResponse.json({ success: true, message: `Subscription downgraded to basic via ${eventType}` });
      }
      
      // If we reach here, event was recognized but conditions weren't met
      console.log(`⚠️ Event ${eventType} recognized but conditions not met (status: ${status})`);
      return NextResponse.json({ success: true, message: `Event ${eventType} processed but no action taken` });
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}