import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get all assessments assigned to a patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'pending', 'completed', 'all'

    let sql = `
      SELECT 
        aa.assignment_id,
        aa.assessment_id,
        aa.user_id,
        aa.assigned_by_therapist_id,
        aa.assigned_at,
        aa.due_date,
        aa.status,
        aa.completed_at,
        aa.score,
        a.name as assessment_name,
        a.assessment_type,
        a.guidance_text,
        t.name as assigned_by_name,
        (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.assessment_id) as total_questions,
        (SELECT COUNT(*) FROM assessment_responses WHERE user_id = aa.user_id AND assessment_id = aa.assessment_id) as answered_questions
      FROM assessment_assignments aa
      JOIN assessments a ON aa.assessment_id = a.assessment_id
      LEFT JOIN therapists t ON aa.assigned_by_therapist_id = t.therapist_id
      WHERE aa.user_id = ?
    `;

    const params_arr = [userId];

    if (status && status !== 'all') {
      sql += ' AND aa.status = ?';
      params_arr.push(status);
    }

    sql += ' ORDER BY aa.assigned_at DESC';

    const assignments = await query(sql, params_arr);

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

// POST - Assign assessment to patient
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const {
      assessment_id,
      therapist_id,
      due_date,
      notes
    } = body;

    if (!assessment_id || !therapist_id) {
      return NextResponse.json(
        { success: false, error: 'assessment_id and therapist_id are required' },
        { status: 400 }
      );
    }

    // Check if assessment exists
    const assessmentCheck = await query(
      'SELECT assessment_id, name FROM assessments WHERE assessment_id = ?',
      [assessment_id]
    );

    if (assessmentCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Check if already assigned and pending
    const existingAssignment = await query(
      `SELECT assignment_id FROM assessment_assignments 
       WHERE user_id = ? AND assessment_id = ? AND status = 'pending'`,
      [userId, assessment_id]
    );

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Assessment already assigned to this patient' },
        { status: 409 }
      );
    }

    // Get next assignment_id
    const maxIdResult: any = await query(
      `SELECT IFNULL(MAX(assignment_id), 0) + 1 as next_id FROM assessment_assignments`
    );
    const nextAssignmentId = maxIdResult[0]?.next_id || 1;

    // Create assignment
    await query(
      `INSERT INTO assessment_assignments 
        (assignment_id, assessment_id, user_id, assigned_by_therapist_id, due_date, status, notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [nextAssignmentId, assessment_id, userId, therapist_id, due_date || null, notes || null]
    );

    // Create notification for patient (wrapped in try-catch so it doesn't break assignment)
    try {
      const maxNotifIdResult: any = await query(
        `SELECT IFNULL(MAX(notification_id), 0) + 1 as next_id FROM notifications`
      );
      const nextNotifId = maxNotifIdResult[0]?.next_id || 1;

      await query(
        `INSERT INTO notifications 
          (notification_id, recipient_type, recipient_id, sender_type, sender_id, notification_type, title, message, related_id, action_url, created_at)
         VALUES (?, 'user', ?, 'therapist', ?, 'assessment', ?, ?, ?, '/assessments', NOW())`,
        [
          nextNotifId,
          userId,
          therapist_id,
          'New Assessment Assigned',
          `Your therapist has assigned you a new assessment: ${assessmentCheck[0].name}. Please complete it at your earliest convenience.`,
          nextAssignmentId
        ]
      );
    } catch (notifError) {
      console.error('Failed to create notification (non-critical):', notifError);
      // Continue anyway - assignment was successful
    }

    return NextResponse.json({
      success: true,
      assignment_id: nextAssignmentId,
      message: 'Assessment assigned successfully'
    });

  } catch (error: any) {
    console.error('Error assigning assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
