import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || '678';

    const result = await query(
      'SELECT * FROM user_symptoms WHERE user_id = ? ORDER BY date_recorded DESC LIMIT 10',
      [userId]
    );

    return NextResponse.json({
      success: true,
      count: result.length,
      symptoms: result
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
