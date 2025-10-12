import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all assessments or specific assessment with questions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');
    const includeQuestions = searchParams.get('includeQuestions') === 'true';

    if (assessmentId) {
      // Fetch specific assessment
      const assessment = await query(`
        SELECT 
          assessment_id,
          name,
          locale,
          version,
          guidance_TEXT
        FROM assessments
        WHERE assessment_id = ?
      `, [assessmentId]);

      if (assessment.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Assessment not found' },
          { status: 404 }
        );
      }

      let result = { assessment: assessment[0] };

      if (includeQuestions) {
        const questions = await query(`
          SELECT 
            question_id,
            assessment_id,
            question_text,
            response_type,
            position
          FROM assessment_questions
          WHERE assessment_id = ?
          ORDER BY position
        `, [assessmentId]);

        (result as any).questions = questions;
      }

      return NextResponse.json({
        success: true,
        ...result
      });
    } else {
      // Fetch all assessments
      const assessments = await query(`
        SELECT 
          assessment_id,
          name,
          locale,
          version,
          guidance_TEXT
        FROM assessments
        ORDER BY name
      `);

      return NextResponse.json({
        success: true,
        assessments
      });
    }

  } catch (error) {
    console.error('Error fetching assessments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, locale, version, guidance_TEXT, questions } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Assessment name is required' },
        { status: 400 }
      );
    }

    // Create assessment
    const assessmentResult = await query(
      `INSERT INTO assessments (name, locale, version, guidance_TEXT)
       VALUES (?, ?, ?, ?)`,
      [name, locale || 'en', version || '1.0', guidance_TEXT || null]
    );

    const assessmentId = (assessmentResult as any).insertId;

    // Add questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        await query(
          `INSERT INTO assessment_questions (assessment_id, question_text, response_type, position)
           VALUES (?, ?, ?, ?)`,
          [assessmentId, question.question_text, question.response_type || 'text', question.position || i + 1]
        );
      }
    }

    return NextResponse.json({
      success: true,
      assessment_id: assessmentId,
      message: 'Assessment created successfully'
    });

  } catch (error) {
    console.error('Error creating assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assessment' },
      { status: 500 }
    );
  }
}