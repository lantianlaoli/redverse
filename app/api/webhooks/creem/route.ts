import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    console.log('Creem webhook received:', JSON.stringify(payload, null, 2));

    // Extract data from webhook payload
    const { object, eventType } = payload;
    console.log(`Processing event: ${eventType}`);
    
    let userId, subscriptionId, status;
    
    if (eventType === 'checkout.completed') {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _checkoutId, status: checkoutStatus, metadata, subscription } = object;
      userId = metadata?.userId;
      subscriptionId = subscription?.id;
      status = checkoutStatus;
    } else if (eventType === 'subscription.canceled') {
      const { metadata, id: subId, status: subStatus } = object;
      userId = metadata?.userId || metadata?.internal_customer_id;
      subscriptionId = subId;
      status = subStatus;
    } else {
      console.log(`Unsupported event type: ${eventType}`);
      return NextResponse.json({ success: true, message: 'Event type not handled' });
    }

    if (!userId) {
      console.error('No userId found in webhook metadata');
      return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
    }

    // Define event types for different plan changes
    const proEvents = ['checkout.completed', 'subscription.active', 'subscription.paid'];
    const basicEvents = ['subscription.canceled', 'subscription.expired'];

    try {
      if (proEvents.includes(eventType)) {
        // Events that should upgrade/maintain user to pro plan
        // Simplified condition - trust the event type more than status
        if (eventType === 'checkout.completed' || 
            eventType === 'subscription.active' || 
            eventType === 'subscription.paid') {
          
          // Check if user already has a subscription
          const { data: existingSubscription } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (existingSubscription) {
            // Update existing subscription to pro
            const { error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                plan_name: 'pro',
                creem_id: subscriptionId
              })
              .eq('user_id', userId);

            if (updateError) {
              console.error('Failed to update subscription:', updateError);
              return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
            }
          } else {
            // Create new pro subscription
            const { error: insertError } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_name: 'pro',
                creem_id: subscriptionId
              });

            if (insertError) {
              console.error('Failed to create subscription:', insertError);
              return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
            }
          }

          console.log(`✅ Successfully upgraded user ${userId} to pro plan (${eventType})`);
          return NextResponse.json({ success: true, message: `Subscription updated to pro via ${eventType}` });
        }
      } else if (basicEvents.includes(eventType)) {
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

    // Handle unrecognized event types
    console.log(`❓ Unrecognized event type: ${eventType}`);
    return NextResponse.json({ success: true, message: `Event type ${eventType} not handled` });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}