import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// GET - Fetch appointments based on your schema
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('user_id');
    const therapistId = searchParams.get('therapist_id');
    
    const connection = await pool.getConnection();
    
    try {
      let query = `
        SELECT 
          a.appointment_id,
          a.user_id,
          a.therapist_id,
          a.start_time,
          a.end_time,
          a.status,
          a.created_at,
          u.name as user_name,
          u.email as user_email,
          u.phone as user_phone,
          t.name as therapist_name,
          t.educational_info,
          t.years_experience,
          t.rating,
          t.fees_min,
          t.fees_max,
          t.interesterd_field
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.user_id
        LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
      `;
      
      const params: any[] = [];
      const conditions: string[] = [];
      
      if (userId) {
        conditions.push('a.user_id = ?');
        params.push(userId);
      }
      
      if (therapistId) {
        conditions.push('a.therapist_id = ?');
        params.push(therapistId);
      }
      
      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      
      query += ' ORDER BY a.start_time DESC';

      const [appointments] = await connection.execute(query, params);

      return NextResponse.json({
        appointments: appointments || []
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create new appointment following your schema
export async function POST(req: Request) {
  try {
    const {
      user_id,
      therapist_id,
      start_time,
      end_time,
      status = 'pending'
    } = await req.json();

    // Validate required fields according to your schema
    if (!user_id || !therapist_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'user_id, therapist_id, start_time, and end_time are required' },
        { status: 400 }
      );
    }

    // Validate status according to your schema
    const validStatuses = ['scheduled', 'pending', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Validate date/time (should be in the future)
    const appointmentStart = new Date(start_time);
    const now = new Date();
    
    if (appointmentStart <= now) {
      return NextResponse.json(
        { error: 'Appointment time must be in the future' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if user exists using your schema field names
      const [users] = await connection.execute(
        'SELECT user_id, name, email FROM users WHERE user_id = ?',
        [user_id]
      );

      if (!Array.isArray(users) || users.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check if therapist exists using your schema field names
      const [therapists] = await connection.execute(
        'SELECT therapist_id, name, email FROM therapists WHERE therapist_id = ?',
        [therapist_id]
      );

      if (!Array.isArray(therapists) || therapists.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Therapist not found' },
          { status: 404 }
        );
      }

      // Check for conflicting appointments (same therapist, overlapping time)
      const [conflicts] = await connection.execute(
        `SELECT appointment_id FROM appointments 
         WHERE therapist_id = ? 
         AND status IN ('scheduled', 'pending') 
         AND (
           (start_time <= ? AND end_time > ?) OR
           (start_time < ? AND end_time >= ?) OR
           (start_time >= ? AND end_time <= ?)
         )`,
        [therapist_id, start_time, start_time, end_time, end_time, start_time, end_time]
      );

      if (Array.isArray(conflicts) && conflicts.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'This time slot conflicts with an existing appointment. Please choose a different time.' },
          { status: 409 }
        );
      }

      // Create the appointment using your exact schema
      const [result] = await connection.execute(
        `INSERT INTO appointments (
          user_id, 
          therapist_id, 
          start_time, 
          end_time, 
          status, 
          created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [user_id, therapist_id, start_time, end_time, status]
      );

      const appointmentId = (result as any).insertId;
      
      await connection.commit();

      // Fetch the complete appointment data to return
      const [newAppointment] = await connection.execute(`
        SELECT 
          a.appointment_id,
          a.user_id,
          a.therapist_id,
          a.start_time,
          a.end_time,
          a.status,
          a.created_at,
          u.name as user_name,
          u.email as user_email,
          t.name as therapist_name,
          t.educational_info
        FROM appointments a
        LEFT JOIN users u ON a.user_id = u.user_id
        LEFT JOIN therapists t ON a.therapist_id = t.therapist_id
        WHERE a.appointment_id = ?
      `, [appointmentId]);

      return NextResponse.json({
        message: 'Appointment created successfully',
        appointment: Array.isArray(newAppointment) ? newAppointment[0] : null
      });

    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT - Update appointment using your schema
export async function PUT(req: Request) {
  try {
    const { 
      appointment_id,
      start_time,
      end_time,
      status 
    } = await req.json();

    if (!appointment_id) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if appointment exists
      const [existing] = await connection.execute(
        'SELECT appointment_id, therapist_id, status FROM appointments WHERE appointment_id = ?',
        [appointment_id]
      );

      if (!Array.isArray(existing) || existing.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      const appointment = existing[0] as any;

      // Validate status if provided
      if (status) {
        const validStatuses = ['scheduled', 'pending', 'cancelled', 'completed'];
        if (!validStatuses.includes(status)) {
          await connection.rollback();
          return NextResponse.json(
            { error: 'Invalid status' },
            { status: 400 }
          );
        }
      }

      // If updating time, check for conflicts
      if (start_time && end_time) {
        const [conflicts] = await connection.execute(
          `SELECT appointment_id FROM appointments 
           WHERE therapist_id = ? 
           AND appointment_id != ?
           AND status IN ('scheduled', 'pending') 
           AND (
             (start_time <= ? AND end_time > ?) OR
             (start_time < ? AND end_time >= ?) OR
             (start_time >= ? AND end_time <= ?)
           )`,
          [appointment.therapist_id, appointment_id, start_time, start_time, end_time, end_time, start_time, end_time]
        );

        if (Array.isArray(conflicts) && conflicts.length > 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: 'This time slot conflicts with an existing appointment' },
            { status: 409 }
          );
        }
      }

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (start_time) {
        updateFields.push('start_time = ?');
        updateValues.push(start_time);
      }

      if (end_time) {
        updateFields.push('end_time = ?');
        updateValues.push(end_time);
      }

      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length === 0) {
        await connection.rollback();
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      updateValues.push(appointment_id);

      const updateQuery = `UPDATE appointments SET ${updateFields.join(', ')} WHERE appointment_id = ?`;
      await connection.execute(updateQuery, updateValues);

      await connection.commit();

      return NextResponse.json({
        message: 'Appointment updated successfully'
      });

    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel appointment
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointment_id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointment_id is required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'UPDATE appointments SET status = ? WHERE appointment_id = ?',
        ['cancelled', appointmentId]
      );

      if ((result as any).affectedRows === 0) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Appointment cancelled successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}