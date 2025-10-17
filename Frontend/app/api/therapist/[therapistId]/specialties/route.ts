import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get therapist's specialties
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    // Get therapist's specialties with specialty details
    const specialties = await query(
      `SELECT 
        ts.therapist_id,
        ts.specialty_id,
        s.name as specialty_name,
        s.description as specialty_description
      FROM therapist_specialties ts
      INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
      WHERE ts.therapist_id = ?`,
      [therapistId]
    );

    return NextResponse.json({
      success: true,
      specialties
    });
  } catch (error: any) {
    console.error('Error fetching therapist specialties:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
