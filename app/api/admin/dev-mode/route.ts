import { NextRequest, NextResponse } from 'next/server';
import { RedisStore } from '@/lib/redis';

// GET - 获取当前开发模式状态
export async function GET() {
  try {
    const devMode = await RedisStore.getDevMode();
    return NextResponse.json({ devMode });
  } catch (error) {
    console.error('Failed to get dev mode:', error);
    return NextResponse.json(
      { error: 'Failed to get dev mode status' },
      { status: 500 }
    );
  }
}

// POST - 设置开发模式状态
export async function POST(request: NextRequest) {
  try {
    const { devMode } = await request.json();
    
    if (typeof devMode !== 'boolean') {
      return NextResponse.json(
        { error: 'devMode must be a boolean' },
        { status: 400 }
      );
    }

    const success = await RedisStore.setDevMode(devMode);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to set dev mode status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      devMode,
      message: `Switched to ${devMode ? 'development' : 'production'} mode` 
    });
  } catch (error) {
    console.error('Failed to set dev mode:', error);
    return NextResponse.json(
      { error: 'Failed to set dev mode status' },
      { status: 500 }
    );
  }
}