import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (email) {
      // Find user by email
      const user = await query('SELECT user_id, name, email FROM users WHERE email = ?', [email]);
      
      if (user && (user as any[]).length > 0) {
        const userId = (user as any)[0].user_id;
        
        // Get their session notes
        const sessionNotes = await query(`
          SELECT sn.*, s.session_date, a.start_time, a.end_time
          FROM session_notes sn
          JOIN sessions s ON sn.session_id = s.session_id
          JOIN appointments a ON s.appointment_id = a.appointment_id
          WHERE a.user_id = ?
          ORDER BY s.session_date DESC
        `, [userId]);
        
        // Get their appointments
        const appointments = await query('SELECT appointment_id, therapist_id, start_time, status FROM appointments WHERE user_id = ?', [userId]);
        
        // Get their sessions
        const sessions = await query(`
          SELECT s.*, a.user_id, a.therapist_id
          FROM sessions s
          JOIN appointments a ON s.appointment_id = a.appointment_id
          WHERE a.user_id = ?
        `, [userId]);
        
        return NextResponse.json({
          success: true,
          user: user[0],
          appointments: appointments,
          sessions: sessions,
          sessionNotes: sessionNotes
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }
    }
    
    console.log('Testing database connection...');
    
    // Test basic connectivity
    const tables = await query('SHOW TABLES');
    console.log('Available tables:', tables);
    
    // Check resources
    const resources = await query('SELECT COUNT(*) as count FROM resources');
    console.log('Resources count:', resources);
    
    // Check therapists
    const therapists = await query('SELECT COUNT(*) as count FROM therapists');
    console.log('Therapists count:', therapists);
    
    // Check users
    const users = await query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', users);
    
    return NextResponse.json({
      success: true,
      tables: tables.length,
      resources: (resources as any)[0]?.count || 0,
      therapists: (therapists as any)[0]?.count || 0,
      users: (users as any)[0]?.count || 0
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queryString, params = [] } = body;
    
    const result = await query(queryString, params);
    
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}