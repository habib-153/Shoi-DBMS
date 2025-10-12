import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('Creating test data...');
    
    // Insert sample resources if none exist
    const existingResources = await query('SELECT COUNT(*) as count FROM resources');
    if ((existingResources as any)[0].count === 0) {
      await query(`
        INSERT INTO resources (title, type, description, author_or_source, link) VALUES
        ('Anxiety Management Techniques', 'article', 'Learn effective techniques to manage anxiety in daily life', 'Dr. Sarah Johnson', 'https://example.com/anxiety-management'),
        ('Mindfulness Meditation Guide', 'video', 'A comprehensive guide to mindfulness meditation for beginners', 'Mindful Living Institute', 'https://example.com/mindfulness-guide'),
        ('Depression Recovery Workbook', 'pdf', 'Interactive workbook with exercises for depression recovery', 'Mental Health Press', 'https://example.com/depression-workbook'),
        ('Sleep Hygiene Checklist', 'checklist', 'Daily checklist to improve sleep quality and patterns', 'Sleep Foundation', 'https://example.com/sleep-checklist'),
        ('Stress Reduction Exercises', 'exercise', 'Physical and mental exercises to reduce stress levels', 'Wellness Center', 'https://example.com/stress-exercises')
      `);
      console.log('Sample resources created');
    }
    
    // Insert sample therapist if none exist
    const existingTherapists = await query('SELECT COUNT(*) as count FROM therapists');
    if ((existingTherapists as any)[0].count === 0) {
      await query(`
        INSERT INTO therapists (name, email, phone, password, specialization, experience_years, license_number, qualification, bio) VALUES
        ('Dr. Emily Carter', 'emily.carter@therapy.com', '+1234567890', 'hashed_password', 'Anxiety, Depression', 8, 'LIC123456', 'PhD in Clinical Psychology', 'Experienced therapist specializing in anxiety and mood disorders.')
      `);
      console.log('Sample therapist created');
    }
    
    // Insert sample user if none exist
    const existingUsers = await query('SELECT COUNT(*) as count FROM users');
    if ((existingUsers as any)[0].count === 0) {
      await query(`
        INSERT INTO users (name, email, phone, password, date_of_birth, gender) VALUES
        ('John Smith', 'john.smith@email.com', '+0987654321', 'hashed_password', '1990-05-15', 'Male')
      `);
      console.log('Sample user created');
    }

    // Get the therapist and user IDs
    const therapists = await query('SELECT therapist_id FROM therapists LIMIT 1');
    const users = await query('SELECT user_id FROM users LIMIT 1');
    
    if (therapists.length > 0 && users.length > 0) {
      const therapistId = (therapists as any)[0].therapist_id;
      const userId = (users as any)[0].user_id;
      
      // Insert sample appointment
      const existingAppointments = await query('SELECT COUNT(*) as count FROM appointments WHERE user_id = ? AND therapist_id = ?', [userId, therapistId]);
      if ((existingAppointments as any)[0].count === 0) {
        const appointmentResult = await query(`
          INSERT INTO appointments (user_id, therapist_id, appointment_date, start_time, end_time, status, appointment_type) VALUES
          (?, ?, CURDATE(), '10:00:00', '11:00:00', 'completed', 'therapy_session')
        `, [userId, therapistId]);
        
        const appointmentId = (appointmentResult as any).insertId;
        console.log('Sample appointment created with ID:', appointmentId);
        
        // Insert sample session
        const sessionResult = await query(`
          INSERT INTO sessions (appointment_id, user_id, therapist_id, session_date, duration_min, session_type, rating_by_user, rating_by_therapist) VALUES
          (?, ?, ?, CURDATE(), 60, 'therapy_session', 5, 4)
        `, [appointmentId, userId, therapistId]);
        
        const sessionId = (sessionResult as any).insertId;
        console.log('Sample session created with ID:', sessionId);
        
        // Insert sample session note
        await query(`
          INSERT INTO session_notes (session_id, summary, homework, therapist_private_notes, visible_to_user) VALUES
          (?, 'Discussed anxiety management techniques and coping strategies', 'Practice deep breathing exercises daily', 'Patient shows good progress, recommend continuing current approach', 1)
        `, [sessionId]);
        console.log('Sample session note created');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully'
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test data: ' + error },
      { status: 500 }
    );
  }
}