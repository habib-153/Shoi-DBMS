import { NextRequest, NextResponse } from "next/server";
import mysql from 'mysql2/promise';
import { query } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  user_id: z.number(),
  therapist_id: z.number(),
  start_time: z.string(), // "YYYY-MM-DD HH:mm:ss"
  end_time: z.string(),
});

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

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = Body.parse(json);

    // clash check
    const [{ c: clashCount }] = await query<{ c: number }>(
      `
      SELECT COUNT(*) as c
      FROM appointments
      WHERE therapist_id = ?
        AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))
        AND status IN ('pending','confirmed','paid')
      `,
      [parsed.therapist_id, parsed.end_time, parsed.start_time, parsed.start_time, parsed.end_time]
    );

    if (clashCount > 0) {
      return NextResponse.json({ ok: false, message: "This time slot is no longer available" }, { status: 409 });
    }

    const result: any = await query(
      `INSERT INTO appointments (user_id, therapist_id, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [parsed.user_id, parsed.therapist_id, parsed.start_time, parsed.end_time]
    );

    return NextResponse.json({ ok: true, appointment_id: result.insertId, message: "Appointment created successfully" });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ ok: false, message: "Failed to create appointment" }, { status: 500 });
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
