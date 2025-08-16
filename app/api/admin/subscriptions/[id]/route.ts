import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - Update subscription plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { plan_name, price_monthly, max_applications, features, enable, creem_product_id, creem_dev_product_id, is_one_time } = await request.json();
    const { id: planId } = await params;

    // Validate required fields
    if (!plan_name || plan_name.trim() === '') {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // Check if plan exists
    const { data: existingPlan, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    if (fetchError || !existingPlan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // If plan name changed, check if new name already exists
    if (plan_name.trim() !== existingPlan.plan_name) {
      const { data: duplicatePlan } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('plan_name', plan_name.trim())
        .neq('id', planId)
        .single();

      if (duplicatePlan) {
        return NextResponse.json(
          { error: 'Plan name already exists' },
          { status: 400 }
        );
      }
    }

    // Update plan
    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update({
        plan_name: plan_name.trim(),
        price_monthly: price_monthly || 0,
        max_applications: max_applications || 1,
        features: features || [],
        enable: enable !== undefined ? enable : true,
        creem_product_id: creem_product_id || null,
        creem_dev_product_id: creem_dev_product_id || null,
        is_one_time: is_one_time || false
      })
      .eq('id', planId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update subscription plan:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete subscription plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

    // First get plan info to be deleted
    const { data: planToDelete, error: fetchError } = await supabase
      .from('subscription_plans')
      .select('plan_name')
      .eq('id', planId)
      .single();

    if (fetchError || !planToDelete) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check if any users are using this plan
    const { data: activeSubscriptions, error: checkError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('plan_name', planToDelete.plan_name)
      .limit(1);

    if (checkError) {
      console.error('Failed to check active subscriptions:', checkError);
      return NextResponse.json(
        { error: 'Failed to verify plan usage' },
        { status: 500 }
      );
    }

    if (activeSubscriptions && activeSubscriptions.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete plan with active subscriptions' },
        { status: 400 }
      );
    }

    // Delete plan
    const { error: deleteError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);

    if (deleteError) {
      console.error('Failed to delete subscription plan:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}