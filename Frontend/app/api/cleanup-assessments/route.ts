import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, keepQuestionCount } = body;

    if (action === 'cleanup') {
      // Step 1: Check current counts
      const responseAnswersCount = await query('SELECT COUNT(*) as count FROM response_answers');
      const assessmentResponsesCount = await query('SELECT COUNT(*) as count FROM assessment_responses');
      const assessmentQuestionsCount = await query('SELECT COUNT(*) as count FROM assessment_questions');

      console.log('Before cleanup:');
      console.log('- response_answers:', responseAnswersCount[0].count);
      console.log('- assessment_responses:', assessmentResponsesCount[0].count);
      console.log('- assessment_questions:', assessmentQuestionsCount[0].count);

      // Step 2: Delete from response_answers (child table first)
      await query('DELETE FROM response_answers');
      console.log('✅ Deleted all response_answers');

      // Step 3: Delete from assessment_responses
      await query('DELETE FROM assessment_responses');
      console.log('✅ Deleted all assessment_responses');

      // Step 4: Keep only the first N questions in assessment_questions
      if (keepQuestionCount && keepQuestionCount > 0) {
        // Get the question_ids to keep (first N by question_id or position)
        const questionsToKeep = await query(
          `SELECT question_id FROM assessment_questions ORDER BY question_id LIMIT ?`,
          [keepQuestionCount]
        );

        const idsToKeep = questionsToKeep.map((q: any) => q.question_id);

        if (idsToKeep.length > 0) {
          // Delete questions NOT in the keep list
          await query(
            `DELETE FROM assessment_questions WHERE question_id NOT IN (${idsToKeep.join(',')})` 
          );
          console.log(`✅ Kept only ${keepQuestionCount} questions in assessment_questions`);
        }
      }

      // Step 5: Check final counts
      const finalResponseAnswers = await query('SELECT COUNT(*) as count FROM response_answers');
      const finalAssessmentResponses = await query('SELECT COUNT(*) as count FROM assessment_responses');
      const finalAssessmentQuestions = await query('SELECT COUNT(*) as count FROM assessment_questions');

      console.log('After cleanup:');
      console.log('- response_answers:', finalResponseAnswers[0].count);
      console.log('- assessment_responses:', finalAssessmentResponses[0].count);
      console.log('- assessment_questions:', finalAssessmentQuestions[0].count);

      return NextResponse.json({
        success: true,
        message: 'Cleanup completed successfully',
        before: {
          response_answers: responseAnswersCount[0].count,
          assessment_responses: assessmentResponsesCount[0].count,
          assessment_questions: assessmentQuestionsCount[0].count
        },
        after: {
          response_answers: finalResponseAnswers[0].count,
          assessment_responses: finalAssessmentResponses[0].count,
          assessment_questions: finalAssessmentQuestions[0].count
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error: any) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET - Check current counts without deleting
export async function GET(request: NextRequest) {
  try {
    const responseAnswersCount = await query('SELECT COUNT(*) as count FROM response_answers');
    const assessmentResponsesCount = await query('SELECT COUNT(*) as count FROM assessment_responses');
    const assessmentQuestionsCount = await query('SELECT COUNT(*) as count FROM assessment_questions');

    // Get sample of assessment questions
    const sampleQuestions = await query(
      'SELECT question_id, question_text, assessment_id FROM assessment_questions ORDER BY question_id LIMIT 20'
    );

    return NextResponse.json({
      success: true,
      counts: {
        response_answers: responseAnswersCount[0].count,
        assessment_responses: assessmentResponsesCount[0].count,
        assessment_questions: assessmentQuestionsCount[0].count
      },
      sample_questions: sampleQuestions
    });
  } catch (error: any) {
    console.error('Error checking counts:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
