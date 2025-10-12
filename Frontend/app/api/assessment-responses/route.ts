import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Submit assessment response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessment_id, user_id, answers, total_score, prelim_insight } = body;

    if (!assessment_id || !user_id || !answers) {
      return NextResponse.json(
        { success: false, error: 'Assessment ID, User ID, and answers are required' },
        { status: 400 }
      );
    }

    // Create assessment response
    const responseResult = await query(
      `INSERT INTO assessment_responses (assessment_id, user_id, total_score, prelim_insight)
       VALUES (?, ?, ?, ?)`,
      [assessment_id, user_id, total_score || null, prelim_insight || null]
    );

    const responseId = (responseResult as any).insertId;

    // Add individual answers
    for (const answer of answers) {
      await query(
        `INSERT INTO response_answers (response_id, question_id, answer_value, free_text)
         VALUES (?, ?, ?, ?)`,
        [
          responseId, 
          answer.question_id, 
          answer.answer_value || null, 
          answer.free_text || null
        ]
      );
    }

    return NextResponse.json({
      success: true,
      response_id: responseId,
      message: 'Assessment response submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting assessment response:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit assessment response' },
      { status: 500 }
    );
  }
}

// GET - Fetch assessment responses for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const assessmentId = searchParams.get('assessmentId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        ar.response_id,
        ar.assessment_id,
        ar.user_id,
        ar.submitted_at,
        ar.total_score,
        ar.prelim_insight,
        a.name as assessment_name,
        a.locale,
        a.version
      FROM assessment_responses ar
      JOIN assessments a ON ar.assessment_id = a.assessment_id
      WHERE ar.user_id = ?
    `;

    const params = [userId];

    if (assessmentId) {
      sql += ` AND ar.assessment_id = ?`;
      params.push(assessmentId);
    }

    sql += ` ORDER BY ar.submitted_at DESC`;

    const responses = await query(sql, params);

    // For each response, get the answers
    for (let response of responses as any[]) {
      const answers = await query(`
        SELECT 
          ra.response_answer_id,
          ra.question_id,
          ra.answer_value,
          ra.free_text,
          aq.question_text,
          aq.response_type
        FROM response_answers ra
        JOIN assessment_questions aq ON ra.question_id = aq.question_id
        WHERE ra.response_id = ?
        ORDER BY aq.position
      `, [response.response_id]);

      response.answers = answers;
    }

    return NextResponse.json({
      success: true,
      responses
    });

  } catch (error) {
    console.error('Error fetching assessment responses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessment responses' },
      { status: 500 }
    );
  }
}