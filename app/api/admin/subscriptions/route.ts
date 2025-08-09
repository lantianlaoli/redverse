import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - 获取所有订阅计划
export async function GET() {
  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 创建新订阅计划
export async function POST(request: NextRequest) {
  try {
    const { plan_name, price_monthly, max_applications, features, enable, creem_product_id, creem_dev_product_id, is_one_time } = await request.json();

    // 验证必填字段
    if (!plan_name || plan_name.trim() === '') {
      return NextResponse.json(
        { error: 'Plan name is required' },
        { status: 400 }
      );
    }

    // 检查计划名称是否已存在
    const { data: existingPlan } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('plan_name', plan_name.trim())
      .single();

    if (existingPlan) {
      return NextResponse.json(
        { error: 'Plan name already exists' },
        { status: 400 }
      );
    }

    // 创建新计划
    const { data: newPlan, error } = await supabase
      .from('subscription_plans')
      .insert({
        plan_name: plan_name.trim(),
        price_monthly: price_monthly || 0,
        max_applications: max_applications || 1,
        features: features || [],
        enable: enable !== undefined ? enable : true,
        creem_product_id: creem_product_id || null,
        creem_dev_product_id: creem_dev_product_id || null,
        is_one_time: is_one_time || false
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create subscription plan:', error);
      return NextResponse.json(
        { error: 'Failed to create subscription plan' },
        { status: 500 }
      );
    }

    return NextResponse.json({ plan: newPlan }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}