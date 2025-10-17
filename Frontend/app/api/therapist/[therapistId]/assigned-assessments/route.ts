import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get all assessments assigned by this therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ therapistId: string }> }
) {
  try {
    const { therapistId } = await params;

    const assignments = await query(
      `SELECT 
        aa.assignment_id,
        aa.assessment_id,
        aa.user_id as patient_id,
        aa.assigned_at,
        aa.due_date,
        aa.status,
        aa.completed_at,
        aa.score,
        aa.notes,
        a.name as assessment_name,
        a.assessment_type,
        COALESCE(u.name, u.email) as patient_name,
        u.email as patient_email
       FROM assessment_assignments aa
       JOIN assessments a ON aa.assessment_id = a.assessment_id
       JOIN users u ON aa.user_id = u.user_id
       WHERE aa.assigned_by_therapist_id = ?
       ORDER BY aa.assigned_at DESC`,
      [therapistId]
    );

    return NextResponse.json({
      success: true,
      assignments
    });

  } catch (error: any) {
    console.error('Error fetching assigned assessments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
