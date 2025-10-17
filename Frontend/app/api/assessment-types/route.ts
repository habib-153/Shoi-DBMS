import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all assessment types/templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapistId = searchParams.get('therapist_id');
    const assessmentId = searchParams.get('assessment_id');
    const includeQuestions = searchParams.get('include_questions') === 'true';

    let assessments;

    if (assessmentId) {
      // Get specific assessment by ID
      assessments = await query(`
        SELECT 
          a.assessment_id,
          a.name,
          a.locale,
          a.version,
          a.guidance_text,
          a.created_by_therapist_id,
          a.is_default,
          a.assessment_type,
          a.created_at,
          COALESCE(t.name, 'System Default') as creator_name,
          (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.assessment_id) as question_count
        FROM assessments a
        LEFT JOIN therapists t ON a.created_by_therapist_id = t.therapist_id
        WHERE a.assessment_id = ?
      `, [assessmentId]);
    } else if (therapistId) {
      // Get assessments created by therapist OR default system assessments
      console.log('Fetching assessments for therapist:', therapistId);
      assessments = await query(`
        SELECT 
          a.assessment_id,
          a.name,
          a.locale,
          a.version,
          a.guidance_text,
          a.created_by_therapist_id,
          a.is_default,
          a.assessment_type,
          a.created_at,
          'System' as creator_name,
          (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.assessment_id) as question_count
        FROM assessments a
        WHERE a.is_default = 1 OR a.created_by_therapist_id = ?
        ORDER BY a.is_default DESC, a.created_at DESC
      `, [therapistId]);
      console.log('Found assessments:', assessments.length);
    } else {
      // Get all default assessments
      assessments = await query(`
        SELECT 
          a.assessment_id,
          a.name,
          a.locale,
          a.version,
          a.guidance_text,
          a.created_by_therapist_id,
          a.is_default,
          a.assessment_type,
          a.created_at,
          'System Default' as creator_name,
          (SELECT COUNT(*) FROM assessment_questions WHERE assessment_id = a.assessment_id) as question_count
        FROM assessments a
        WHERE a.is_default = 1
        ORDER BY a.name
      `);
    }

    if (includeQuestions) {
      // Fetch questions for each assessment
      for (const assessment of assessments as any[]) {
        const questions = await query(`
          SELECT 
            question_id,
            assessment_id,
            question_text,
            response_type,
            position,
            options
          FROM assessment_questions
          WHERE assessment_id = ?
          ORDER BY position
        `, [assessment.assessment_id]);
        assessment.questions = questions;
      }
    }

    return NextResponse.json({
      success: true,
      assessments
    });

  } catch (error: any) {
    console.error('Error fetching assessment types:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new assessment template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      locale = 'en',
      version = '1.0',
      guidance_text,
      therapist_id,
      is_default = 0,
      assessment_type,
      questions = []
    } = body;

    if (!name || !assessment_type) {
      return NextResponse.json(
        { success: false, error: 'Name and assessment_type are required' },
        { status: 400 }
      );
    }

    // Get next assessment_id
    const maxAssessmentIdResult: any = await query(
      `SELECT IFNULL(MAX(assessment_id), 0) + 1 as next_id FROM assessments`
    );
    const nextAssessmentId = maxAssessmentIdResult[0]?.next_id || 1;
    
    console.log('Max ID query result:', maxAssessmentIdResult);
    console.log('Creating assessment with ID:', nextAssessmentId);

    // Insert assessment
    await query(
      `INSERT INTO assessments (assessment_id, name, locale, version, guidance_text, created_by_therapist_id, is_default, assessment_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nextAssessmentId, name, locale, version, guidance_text, therapist_id || null, is_default, assessment_type]
    );

    // Insert questions if provided
    if (questions.length > 0) {
      // Get starting question ID ONCE before the loop
      const maxQIdResult: any = await query(
        `SELECT IFNULL(MAX(question_id), 0) as max_id FROM assessment_questions`
      );
      let nextQuestionId = (maxQIdResult[0]?.max_id || 0) + 1;
      
      console.log('Max question ID result:', maxQIdResult);
      console.log('Starting question ID:', nextQuestionId, 'for', questions.length, 'questions');
      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        
        await query(
          `INSERT INTO assessment_questions (question_id, assessment_id, question_text, response_type, position, scale_min, scale_max, options)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            nextQuestionId, 
            nextAssessmentId, 
            q.question_text, 
            q.response_type, 
            q.position || (i + 1), 
            q.scale_min || null, 
            q.scale_max || null, 
            q.options || null
          ]
        );
        
        // Increment for next question
        nextQuestionId++;
      }
    }

    return NextResponse.json({
      success: true,
      assessment_id: nextAssessmentId,
      message: 'Assessment created successfully'
    });

  } catch (error: any) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
