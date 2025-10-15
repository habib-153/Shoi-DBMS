import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Create a new referral
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== REFERRAL API CALLED ===');
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const {
      user_id,
      referring_therapist_id,
      referred_to_therapist_id,
      session_id,
      reason,
      severity_level,
      symptoms,
      current_medication,
      additional_notes
    } = body;

    console.log('Extracted values:', {
      user_id,
      referring_therapist_id,
      referred_to_therapist_id,
      session_id,
      reason,
      severity_level
    });

    // Validation
    if (!user_id || !referring_therapist_id || !reason || !referred_to_therapist_id) {
      return NextResponse.json(
        { success: false, error: 'user_id, referring_therapist_id, referred_to_therapist_id, and reason are required' },
        { status: 400 }
      );
    }

    if (!['severe', 'critical'].includes(severity_level)) {
      return NextResponse.json(
        { success: false, error: 'severity_level must be severe or critical (moderate cases cannot be referred to psychiatrists)' },
        { status: 400 }
      );
    }

    // Verify referring therapist exists
    const therapist: any[] = await query(
      'SELECT therapist_id, name, Interested_field FROM therapists WHERE therapist_id = ?',
      [referring_therapist_id]
    );

    if (therapist.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Referring therapist not found' },
        { status: 404 }
      );
    }

    // Verify patient exists
    const patient: any[] = await query(
      'SELECT user_id, name, email FROM users WHERE user_id = ?',
      [user_id]
    );

    if (patient.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Patient not found' },
        { status: 404 }
      );
    }

    // If referred_to_therapist_id is provided, verify it exists and is a psychiatrist
    const psychiatristCheck: any[] = await query(
      `SELECT t.therapist_id, t.name, t.Interested_field, ts.specialty_id
       FROM therapists t
       INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
       WHERE t.therapist_id = ?`,
      [referred_to_therapist_id]
    );

    if (psychiatristCheck.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Specified psychiatrist not found' },
        { status: 404 }
      );
    }

    // Verify they are a psychiatrist (specialty_id = 2)
    if (psychiatristCheck[0].specialty_id !== 2) {
      return NextResponse.json(
        { success: false, error: 'Can only refer to psychiatrists. The selected therapist is not a psychiatrist.' },
        { status: 400 }
      );
    }

    // If session_id provided, verify it exists and belongs to the referring therapist
    if (session_id) {
      const session: any[] = await query(
        `SELECT s.session_id, a.therapist_id, a.user_id
         FROM sessions s
         JOIN appointments a ON s.appointment_id = a.appointment_id
         WHERE s.session_id = ?`,
        [session_id]
      );

      if (session.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      }

      if (session[0].therapist_id !== referring_therapist_id) {
        return NextResponse.json(
          { success: false, error: 'Session does not belong to referring therapist' },
          { status: 403 }
        );
      }

      if (session[0].user_id !== user_id) {
        return NextResponse.json(
          { success: false, error: 'Session does not belong to the specified patient' },
          { status: 403 }
        );
      }
    }

    // Create the referral
    const insertParams = [
      user_id,
      referring_therapist_id,
      referred_to_therapist_id,
      session_id !== undefined ? session_id : null,
      reason,
      severity_level,
      symptoms !== undefined ? symptoms : null,
      current_medication !== undefined ? current_medication : null,
      additional_notes !== undefined ? additional_notes : null
    ];
    
    console.log('INSERT parameters:', insertParams);
    console.log('Parameter types:', insertParams.map((p, i) => `[${i}]: ${typeof p} = ${p}`));
    
    const result: any = await query(
      `INSERT INTO referrals (
        user_id,
        referring_therapist_id,
        referred_to_therapist_id,
        session_id,
        reason,
        severity_level,
        symptoms,
        current_medication,
        additional_notes,
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      insertParams
    );

    console.log('INSERT result:', result);
    console.log('INSERT result type:', typeof result);
    console.log('insertId:', result.insertId);
    
    const referralId = result.insertId;
    console.log('referralId to use in SELECT:', referralId, 'type:', typeof referralId);

    // Fetch the created referral with full details
    const referral: any[] = await query(
      `SELECT 
        r.*,
        u.name as patient_name,
        u.email as patient_email,
        rt.name as referring_therapist_name,
        rt.Interested_field as referring_specialization,
        pt.name as referred_to_therapist_name,
        pt.Interested_field as referred_to_specialization
      FROM referrals r
      JOIN users u ON r.user_id = u.user_id
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      WHERE r.referral_id = ?`,
      [referralId]
    );

    // Send notification to the psychiatrist
    try {
      await query(
        `INSERT INTO notifications 
          (recipient_type, recipient_id, sender_type, sender_id, notification_type, 
           title, message, related_id, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'therapist',
          referred_to_therapist_id,
          'therapist',
          referring_therapist_id,
          'referral',
          'New Patient Referral',
          `${therapist[0].name} has referred patient ${patient[0].name} to you. Severity: ${severity_level}. Reason: ${reason}`,
          referralId,
          `/therapist/referrals`
        ]
      );
      console.log(`Notification sent to psychiatrist ${referred_to_therapist_id}`);
    } catch (notifError) {
      console.error('Failed to send notification to psychiatrist:', notifError);
      // Don't fail the referral creation if notification fails
    }

    // Send notification to the patient
    try {
      await query(
        `INSERT INTO notifications 
          (recipient_type, recipient_id, sender_type, sender_id, notification_type, 
           title, message, related_id, action_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'user',
          user_id,
          'therapist',
          referring_therapist_id,
          'referral',
          'You Have Been Referred to a Psychiatrist',
          `Your psychologist Dr. ${therapist[0].name} has referred you to Dr. ${psychiatristCheck[0].name} for specialized psychiatric care. You can view the referral details and contact information in your Session Notes.`,
          referralId,
          `/session-notes`
        ]
      );
      console.log(`Notification sent to patient ${user_id}`);
    } catch (notifError) {
      console.error('Failed to send notification to patient:', notifError);
      // Don't fail the referral creation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Referral created successfully',
      referral: referral[0],
      referral_id: referralId
    }, { status: 201 });

  } catch (error: any) {
    console.error('=== ERROR IN REFERRAL API ===');
    console.error('Error creating referral:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body was:', await request.clone().json().catch(() => 'Could not read body'));
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create referral',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Get all referrals (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity_level = searchParams.get('severity_level');
    const user_id = searchParams.get('user_id');
    const referring_therapist_id = searchParams.get('referring_therapist_id');
    const referred_to_therapist_id = searchParams.get('referred_to_therapist_id');

    let sql = `
      SELECT 
        r.*,
        u.name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone,
        rt.name as referring_therapist_name,
        rt.email as referring_therapist_email,
        rt.Interested_field as referring_specialization,
        pt.name as referred_to_therapist_name,
        pt.email as referred_to_therapist_email,
        pt.Interested_field as referred_to_specialization,
        s.session_date
      FROM referrals r
      JOIN users u ON r.user_id = u.user_id
      JOIN therapists rt ON r.referring_therapist_id = rt.therapist_id
      LEFT JOIN therapists pt ON r.referred_to_therapist_id = pt.therapist_id
      LEFT JOIN sessions s ON r.session_id = s.session_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }

    if (severity_level) {
      sql += ' AND r.severity_level = ?';
      params.push(severity_level);
    }

    if (user_id) {
      sql += ' AND r.user_id = ?';
      params.push(user_id);
    }

    if (referring_therapist_id) {
      sql += ' AND r.referring_therapist_id = ?';
      params.push(referring_therapist_id);
    }

    if (referred_to_therapist_id) {
      sql += ' AND r.referred_to_therapist_id = ?';
      params.push(referred_to_therapist_id);
    }

    sql += ' ORDER BY r.created_at DESC';

    const referrals = await query(sql, params);

    return NextResponse.json({
      success: true,
      referrals,
      count: referrals.length
    });

  } catch (error: any) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch referrals',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
