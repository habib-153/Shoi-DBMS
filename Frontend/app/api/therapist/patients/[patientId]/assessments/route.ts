import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get patient's assessment history with responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await params;

    // Get all completed assessments for this patient
    const assessments = await query(
      `SELECT 
        aa.assignment_id,
        aa.assessment_id,
        aa.completed_at,
        aa.score,
        a.name as assessment_name,
        a.assessment_type
       FROM assessment_assignments aa
       JOIN assessments a ON aa.assessment_id = a.assessment_id
       WHERE aa.user_id = ? AND aa.status = 'completed'
       ORDER BY aa.completed_at DESC`,
      [patientId]
    );

    // For each assessment, get the detailed responses (now directly from assessment_responses)
    for (const assessment of assessments as any[]) {
      const responses = await query(
        `SELECT 
          ar.response_id,
          ar.question_id,
          ar.response_value as answer_value,
          ar.response_text as free_text,
          aq.question_text,
          aq.response_type,
          aq.options,
          aq.position
         FROM assessment_responses ar
         JOIN assessment_questions aq ON ar.question_id = aq.question_id
         WHERE ar.assignment_id = ?
         ORDER BY aq.position`,
        [assessment.assignment_id]
      );
      assessment.responses = responses;
    }

    return NextResponse.json({
      success: true,
      assessments
    });

  } catch (error: any) {
    console.error('Error fetching patient assessments:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
