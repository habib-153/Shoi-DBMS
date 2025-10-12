import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Get questions for a specific assessment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;

    const questions = await query(`
      SELECT 
        aq.question_id,
        aq.assessment_id,
        aq.question_text,
        aq.question_type,
        aq.options,
        aq.question_order,
        a.title as assessment_title,
        a.description as assessment_description
      FROM assessment_questions aq
      JOIN assessments a ON aq.assessment_id = a.assessment_id
      WHERE aq.assessment_id = ?
      ORDER BY aq.question_order
    `, [assessmentId]);

    return NextResponse.json({
      success: true,
      questions
    });
  } catch (error) {
    console.error("Error fetching assessment questions:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch questions"
    }, { status: 500 });
  }
}

// POST - Add question to assessment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessmentId = id;
    const body = await request.json();
    const { question_text, question_type, options, question_order } = body;

    if (!question_text || !question_type) {
      return NextResponse.json(
        { success: false, error: 'Question text and type are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO assessment_questions (assessment_id, question_text, question_type, options, question_order) VALUES (?, ?, ?, ?, ?)',
      [assessmentId, question_text, question_type, options || null, question_order || 0]
    );

    return NextResponse.json({
      success: true,
      question_id: (result as any).insertId,
      message: "Question added successfully"
    });
  } catch (error) {
    console.error("Error adding question:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to add question"
    }, { status: 500 });
  }
}