import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Submit assessment responses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;
    const body = await request.json();
    const { responses } = body; // Array of { question_id, answer_value, answer_text }

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Responses are required' },
        { status: 400 }
      );
    }

    // Get assignment details
    const assignment: any = await query(
      `SELECT aa.*, a.name as assessment_name 
       FROM assessment_assignments aa
       JOIN assessments a ON aa.assessment_id = a.assessment_id
       WHERE aa.assignment_id = ?`,
      [assignmentId]
    );

    if (!assignment || assignment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const assignmentData = assignment[0];

    // Calculate total score
    let totalScore = 0;
    for (const resp of responses) {
      if (resp.answer_value !== null && resp.answer_value !== undefined) {
        totalScore += parseInt(resp.answer_value);
      }
    }

    // Insert individual answer responses directly into assessment_responses
    for (const resp of responses) {
      const [maxRespId]: any = await query(
        `SELECT IFNULL(MAX(response_id), 0) + 1 as next_id FROM assessment_responses`
      );
      const nextResponseId = maxRespId[0]?.next_id || 1;

      await query(
        `INSERT INTO assessment_responses 
          (response_id, assessment_id, user_id, question_id, response_value, response_text, submitted_at, total_score, assignment_id)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          nextResponseId,
          assignmentData.assessment_id,
          assignmentData.user_id,
          resp.question_id,
          resp.answer_value || null,
          resp.answer_text || null,
          totalScore,
          assignmentId
        ]
      );
    }

    // Update assignment status
    await query(
      `UPDATE assessment_assignments 
       SET status = 'completed', completed_at = NOW(), score = ?
       WHERE assignment_id = ?`,
      [totalScore, assignmentId]
    );

    // Create notification for therapist (wrapped in try-catch so it doesn't break assessment submission)
    try {
      const [maxNotifId]: any = await query(
        `SELECT IFNULL(MAX(notification_id), 0) + 1 as next_id FROM notifications`
      );
      const nextNotifId = maxNotifId[0]?.next_id || 1;

      await query(
        `INSERT INTO notifications 
          (notification_id, recipient_type, recipient_id, sender_type, sender_id, notification_type, title, message, related_id, action_url, created_at)
         VALUES (?, 'therapist', ?, 'user', ?, 'assessment', ?, ?, ?, ?, NOW())`,
        [
          nextNotifId,
          assignmentData.assigned_by_therapist_id,
          assignmentData.user_id,
          'Assessment Completed',
          `Your patient has completed the assessment: ${assignmentData.assessment_name}. Score: ${totalScore}`,
          assignmentId,
          `/therapist/patients/${assignmentData.user_id}?tab=assessments`
        ]
      );
    } catch (notifError) {
      console.error('Failed to create notification:', notifError);
      // Continue anyway - notification failure shouldn't break assessment submission
    }

    return NextResponse.json({
      success: true,
      total_score: totalScore,
      message: 'Assessment submitted successfully'
    });

  } catch (error: any) {
    console.error('Error submitting assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get responses for an assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;

    // Get assignment with responses
    const assignment = await query(
      `SELECT 
        aa.*,
        a.name as assessment_name,
        a.guidance_text,
        ar.response_id,
        ar.total_score,
        ar.submitted_at
       FROM assessment_assignments aa
       JOIN assessments a ON aa.assessment_id = a.assessment_id
       LEFT JOIN assessment_responses ar ON ar.assignment_id = aa.assignment_id
       WHERE aa.assignment_id = ?
       LIMIT 1`,
      [assignmentId]
    );

    if (assignment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Get individual responses if completed (now directly from assessment_responses)
    let responses = [];
    if (assignment[0].total_score !== null) {
      responses = await query(
        `SELECT 
          ar.response_id,
          ar.question_id,
          ar.response_value as answer_value,
          ar.response_text as free_text,
          aq.question_text,
          aq.response_type,
          aq.options
         FROM assessment_responses ar
         JOIN assessment_questions aq ON ar.question_id = aq.question_id
         WHERE ar.assignment_id = ?
         ORDER BY aq.position`,
        [assignmentId]
      );
    }

    return NextResponse.json({
      success: true,
      assignment: assignment[0],
      responses
    });

  } catch (error: any) {
    console.error('Error fetching assessment responses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
