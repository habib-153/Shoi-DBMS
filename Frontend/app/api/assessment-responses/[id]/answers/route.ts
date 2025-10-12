import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Get answers for a specific assessment response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const responseId = id;

    const answers = await query(`
      SELECT 
        ra.answer_id,
        ra.response_id,
        ra.question_id,
        ra.answer_text,
        ra.answered_at,
        aq.question_text,
        aq.question_type,
        aq.options
      FROM response_answers ra
      JOIN assessment_questions aq ON ra.question_id = aq.question_id
      WHERE ra.response_id = ?
      ORDER BY aq.question_order
    `, [responseId]);

    return NextResponse.json({
      success: true,
      answers
    });
  } catch (error) {
    console.error("Error fetching response answers:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch answers"
    }, { status: 500 });
  }
}

// POST - Add answer to assessment response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const responseId = id;
    const body = await request.json();
    const { question_id, answer_text } = body;

    if (!question_id || !answer_text) {
      return NextResponse.json(
        { success: false, error: 'Question ID and answer text are required' },
        { status: 400 }
      );
    }

    // Check if answer already exists for this question
    const existingAnswer = await query(
      'SELECT * FROM response_answers WHERE response_id = ? AND question_id = ?',
      [responseId, question_id]
    );

    if (existingAnswer.length > 0) {
      // Update existing answer
      await query(
        'UPDATE response_answers SET answer_text = ?, answered_at = CURRENT_TIMESTAMP WHERE response_id = ? AND question_id = ?',
        [answer_text, responseId, question_id]
      );
    } else {
      // Insert new answer
      await query(
        'INSERT INTO response_answers (response_id, question_id, answer_text) VALUES (?, ?, ?)',
        [responseId, question_id, answer_text]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Answer saved successfully"
    });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save answer"
    }, { status: 500 });
  }
}