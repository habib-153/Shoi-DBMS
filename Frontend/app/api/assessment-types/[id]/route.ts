import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get specific assessment with questions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    const assessment = await query(
      `SELECT 
        a.assessment_id,
        a.name,
        a.locale,
        a.version,
        a.guidance_text,
        a.created_by_therapist_id,
        a.is_default,
        a.assessment_type,
        a.created_at,
        COALESCE(t.name, 'System Default') as creator_name
       FROM assessments a
       LEFT JOIN therapists t ON a.created_by_therapist_id = t.therapist_id
       WHERE a.assessment_id = ?`,
      [assessmentId]
    );

    if (assessment.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Get questions
    const questions = await query(
      `SELECT 
        question_id,
        question_text,
        response_type,
        position,
        scale_min,
        scale_max,
        options
       FROM assessment_questions
       WHERE assessment_id = ?
       ORDER BY position`,
      [assessmentId]
    );

    return NextResponse.json({
      success: true,
      assessment: {
        ...assessment[0],
        questions
      }
    });

  } catch (error: any) {
    console.error('Error fetching assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update assessment and questions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;
    const body = await request.json();
    const { name, type, guidance_text, questions } = body;

    // Check if assessment exists and is editable
    const existing = await query(
      'SELECT assessment_id, is_default, created_by_therapist_id FROM assessments WHERE assessment_id = ?',
      [assessmentId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Update assessment
    await query(
      `UPDATE assessments 
       SET name = ?, 
           assessment_type = ?, 
           guidance_text = ?
       WHERE assessment_id = ?`,
      [name, type, guidance_text, assessmentId]
    );

    // Get next available question ID BEFORE deleting (important!)
    const maxIdResult: any = await query(
      'SELECT IFNULL(MAX(question_id), 0) as max_id FROM assessment_questions'
    );
    let nextQuestionId = (maxIdResult[0]?.max_id || 0) + 1;
    
    console.log('Max question ID result:', maxIdResult);
    console.log('Max question ID before delete:', maxIdResult[0]?.max_id);
    console.log('Will start inserting from ID:', nextQuestionId);

    // Now delete existing questions for this assessment
    await query('DELETE FROM assessment_questions WHERE assessment_id = ?', [assessmentId]);

    // Insert updated questions
    if (questions && questions.length > 0) {

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        await query(
          `INSERT INTO assessment_questions 
            (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max, options)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nextQuestionId,
            assessmentId,
            q.question_text || q.text,
            q.response_type || q.type,
            i + 1,
            q.scale_min || null,
            q.scale_max || null,
            q.options ? JSON.stringify(q.options) : null
          ]
        );
        
        // Increment for next question
        nextQuestionId++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete assessment (only custom ones)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assessmentId } = await params;

    // Check if assessment exists
    const existing = await query(
      'SELECT assessment_id, is_default FROM assessments WHERE assessment_id = ?',
      [assessmentId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Assessment not found' },
        { status: 404 }
      );
    }

    const assessment = existing[0] as any;

    // Don't allow deleting default assessments
    if (assessment.is_default === 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete default assessments' },
        { status: 403 }
      );
    }

    // Delete assessment (CASCADE will delete questions, assignments, responses)
    await query('DELETE FROM assessments WHERE assessment_id = ?', [assessmentId]);

    return NextResponse.json({
      success: true,
      message: 'Assessment deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
