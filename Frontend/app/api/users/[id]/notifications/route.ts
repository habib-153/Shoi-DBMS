import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('API: Fetching notifications for user ID:', id);
    
    // Return empty notifications for now
    return NextResponse.json({
      notifications: []
    });
    
  } catch (error) {
    console.error('API: Error fetching user notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}