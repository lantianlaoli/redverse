import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PUT - 更新订阅计划
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { plan_name, price_monthly, max_applications, features } = await request.json();
    const { id: planId } = await params;

    // 验证必填字段
    if (!plan_name || plan_name.trim() === '') {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // 检查计划是否存在
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

    // 如果计划名称变更，检查新名称是否已存在
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

    // 更新计划
    const { data: updatedPlan, error: updateError } = await supabase
      .from('subscription_plans')
      .update({
        plan_name: plan_name.trim(),
        price_monthly: price_monthly || 0,
        max_applications: max_applications || 1,
        features: features || []
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

// DELETE - 删除订阅计划
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await params;

    // 先获取要删除的计划信息
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

    // 检查是否有用户正在使用此计划
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

    // 删除计划
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