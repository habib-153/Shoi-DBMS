import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Submit a rating for a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId: id } = await params;
    const sessionId = parseInt(id);
    const body = await request.json();
    const { rating, user_id } = body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to the user
    const sessionResult = await query(`
      SELECT s.session_id, s.appointment_id, s.rating_by_user, a.user_id, a.therapist_id
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      WHERE s.session_id = ?
    `, [sessionId]);

    if (sessionResult.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionResult[0];

    // Verify the user is authorized to rate this session
    if (session.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to rate this session' },
        { status: 403 }
      );
    }

    // Check if already rated
    if (session.rating_by_user !== null) {
      return NextResponse.json(
        { success: false, error: 'This session has already been rated' },
        { status: 400 }
      );
    }

    // Update session rating
    await query(
      `UPDATE sessions SET rating_by_user = ? WHERE session_id = ?`,
      [rating, sessionId]
    );

    // Calculate and update therapist's average rating
    const avgRatingResult = await query(`
      SELECT AVG(s.rating_by_user) as avg_rating
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      WHERE a.therapist_id = ? AND s.rating_by_user IS NOT NULL
    `, [session.therapist_id]);

    const avgRating = parseFloat(avgRatingResult[0]?.avg_rating || 0);

    // Update therapist's rating
    await query(
      `UPDATE therapists SET rating = ? WHERE therapist_id = ?`,
      [avgRating, session.therapist_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      rating: rating,
      therapist_avg_rating: avgRating.toFixed(1)
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

// GET - Fetch rating for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId: id } = await params;
    const sessionId = parseInt(id);

    const result = await query(`
      SELECT 
        s.session_id,
        s.rating_by_user,
        a.user_id,
        a.therapist_id,
        t.name as therapist_name,
        t.rating as therapist_avg_rating
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN therapists t ON a.therapist_id = t.therapist_id
      WHERE s.session_id = ?
    `, [sessionId]);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id: result[0].session_id,
      rating: result[0].rating_by_user,
      therapist_name: result[0].therapist_name,
      therapist_avg_rating: result[0].therapist_avg_rating
    });

  } catch (error) {
    console.error('Error fetching rating:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}
