import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Get all therapist relationships data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;

    // Get therapist basic info
    const therapistInfo = await query(`
      SELECT * FROM therapists 
      WHERE therapist_id = ?
    `, [therapistId]);

    // Get therapist specialties
    const specialties = await query(`
      SELECT 
        ts.*,
        s.specialty_name,
        s.description
      FROM therapist_specialties ts
      JOIN specialties s ON ts.specialty_id = s.specialty_id
      WHERE ts.therapist_id = ?
    `, [therapistId]);

    // Get appointments with users
    const appointments = await query(`
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM appointments a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.therapist_id = ?
      ORDER BY a.start_time DESC
    `, [therapistId]);

    // Get sessions conducted
    const sessions = await query(`
      SELECT 
        s.*,
        a.user_id,
        u.name as user_name
      FROM sessions s
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      WHERE a.therapist_id = ?
      ORDER BY s.session_date DESC
    `, [therapistId]);

    // Get session notes written
    const sessionNotes = await query(`
      SELECT 
        sn.*,
        s.session_date,
        a.user_id,
        u.name as user_name
      FROM session_notes sn
      JOIN sessions s ON sn.session_id = s.session_id
      JOIN appointments a ON s.appointment_id = a.appointment_id
      JOIN users u ON a.user_id = u.user_id
      WHERE a.therapist_id = ?
      ORDER BY sn.created_at DESC
    `, [therapistId]);

    // Get resources suggested by this therapist
    const suggestedResources = await query(`
      SELECT 
        ur.*,
        r.title,
        r.description,
        r.resource_type,
        u.name as user_name
      FROM user_resources ur
      JOIN resources r ON ur.resource_id = r.resource_id
      JOIN users u ON ur.user_id = u.user_id
      WHERE ur.suggested_by = ?
      ORDER BY ur.assigned_at DESC
    `, [therapistId]);

    // Get payment statistics
    const paymentStats = await query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as pending_amount
      FROM payments p
      JOIN appointments a ON p.appointment_id = a.appointment_id
      WHERE a.therapist_id = ?
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      data: {
        therapist: therapistInfo[0] || null,
        specialties: specialties,
        appointments: appointments,
        sessions: sessions,
        session_notes: sessionNotes,
        suggested_resources: suggestedResources,
        payment_stats: paymentStats[0] || null
      }
    });
  } catch (error) {
    console.error("Error fetching therapist relationships:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch therapist relationships"
    }, { status: 500 });
  }
}