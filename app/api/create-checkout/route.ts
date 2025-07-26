import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail } = await request.json();

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

    const response = await fetch(process.env.CREEM_API_URL!, {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'User-Agent': 'RedverseApp/1.0.0',
        'x-api-key': process.env.CREEM_API_KEY!,
      },
      body: JSON.stringify({
        customer: {
          email: userEmail
        },
        product_id: process.env.CREEM_PRODUCT_ID!,
        metadata: {
          userId: userId
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