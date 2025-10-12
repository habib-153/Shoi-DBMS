import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// GET - Fetch conversations for a user or therapist
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type'); // 'user' or 'therapist'
    const userId = searchParams.get('user_id');
    const conversationWith = searchParams.get('conversation_with'); // optional: get specific conversation
    const withType = searchParams.get('with_type'); // 'user' or 'therapist'

    if (!userType || !userId) {
      return NextResponse.json(
        { error: 'user_type and user_id are required' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      if (conversationWith && withType) {
        // Get specific conversation
        const [messages] = await connection.execute(
          `SELECT m.*, 
           CASE 
             WHEN m.sender_type = 'user' THEN u.name
             WHEN m.sender_type = 'therapist' THEN t.name
           END as sender_name,
           CASE 
             WHEN m.receiver_type = 'user' THEN u2.name
             WHEN m.receiver_type = 'therapist' THEN t2.name
           END as receiver_name
           FROM messages m
           LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.user_id
           LEFT JOIN therapists t ON m.sender_type = 'therapist' AND m.sender_id = t.therapist_id
           LEFT JOIN users u2 ON m.receiver_type = 'user' AND m.receiver_id = u2.user_id
           LEFT JOIN therapists t2 ON m.receiver_type = 'therapist' AND m.receiver_id = t2.therapist_id
           WHERE ((m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
              OR (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?))
           ORDER BY m.created_at ASC`,
          [userType, userId, withType, conversationWith, withType, conversationWith, userType, userId]
        );

        // Mark messages as read
        await connection.execute(
          `UPDATE messages SET is_read = TRUE 
           WHERE receiver_type = ? AND receiver_id = ? AND sender_type = ? AND sender_id = ?`,
          [userType, userId, withType, conversationWith]
        );

        return NextResponse.json({ messages });
      } else {
        // Get all conversations (list of people the user has chatted with)
        // But only show conversations with users/therapists who have paid appointments
        let conversationQuery, queryParams;
        
        if (userType === 'user') {
          // For users: only show therapists they have paid appointments with
          conversationQuery = `
            SELECT DISTINCT
              'therapist' as contact_type,
              t.therapist_id as contact_id,
              t.name as contact_name,
              t.image as contact_image,
              MAX(m.created_at) as last_message_time,
              COUNT(CASE WHEN m.receiver_type = ? AND m.receiver_id = ? AND m.is_read = FALSE THEN 1 END) as unread_count
            FROM therapists t
            INNER JOIN appointments a ON t.therapist_id = a.therapist_id
            INNER JOIN payments p ON a.appointment_id = p.appointment_id
            LEFT JOIN messages m ON (
              (m.sender_type = 'user' AND m.sender_id = ? AND m.receiver_type = 'therapist' AND m.receiver_id = t.therapist_id)
              OR (m.sender_type = 'therapist' AND m.sender_id = t.therapist_id AND m.receiver_type = 'user' AND m.receiver_id = ?)
            )
            WHERE a.user_id = ? 
              AND (p.status = 'completed' OR p.status = 'paid')
            GROUP BY t.therapist_id, t.name, t.image
            ORDER BY last_message_time DESC`;
          queryParams = [userType, userId, userId, userId, userId];
        } else {
          // For therapists: only show users who have paid appointments with them
          conversationQuery = `
            SELECT DISTINCT
              'user' as contact_type,
              u.user_id as contact_id,
              u.name as contact_name,
              '' as contact_image,
              MAX(m.created_at) as last_message_time,
              COUNT(CASE WHEN m.receiver_type = ? AND m.receiver_id = ? AND m.is_read = FALSE THEN 1 END) as unread_count
            FROM users u
            INNER JOIN appointments a ON u.user_id = a.user_id
            INNER JOIN payments p ON a.appointment_id = p.appointment_id
            LEFT JOIN messages m ON (
              (m.sender_type = 'user' AND m.sender_id = u.user_id AND m.receiver_type = 'therapist' AND m.receiver_id = ?)
              OR (m.sender_type = 'therapist' AND m.sender_id = ? AND m.receiver_type = 'user' AND m.receiver_id = u.user_id)
            )
            WHERE a.therapist_id = ? 
              AND (p.status = 'completed' OR p.status = 'paid')
            GROUP BY u.user_id, u.name
            ORDER BY last_message_time DESC`;
          queryParams = [userType, userId, userId, userId, userId];
        }

        const [conversations] = await connection.execute(conversationQuery, queryParams);

        return NextResponse.json({ conversations });
      }
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const { 
      sender_type, 
      sender_id, 
      receiver_type, 
      receiver_id, 
      message_text, 
      message_type = 'text',
      appointment_id = null 
    } = await request.json();

    if (!sender_type || !sender_id || !receiver_type || !receiver_id || !message_text) {
      return NextResponse.json(
        { error: 'sender_type, sender_id, receiver_type, receiver_id, and message_text are required' },
        { status: 400 }
      );
    }

    // Verify that the sender and receiver have a paid appointment relationship
    const connection = await pool.getConnection();
    
    try {
      let userId, therapistId;
      if (sender_type === 'user' && receiver_type === 'therapist') {
        userId = sender_id;
        therapistId = receiver_id;
      } else if (sender_type === 'therapist' && receiver_type === 'user') {
        userId = receiver_id;
        therapistId = sender_id;
      } else {
        return NextResponse.json(
          { error: 'Messages can only be sent between users and therapists' },
          { status: 400 }
        );
      }

      // Check if there's a paid appointment between user and therapist
      const [paidAppointments] = await connection.execute(
        `SELECT COUNT(*) as count
         FROM appointments a
         INNER JOIN payments p ON a.appointment_id = p.appointment_id
         WHERE a.user_id = ? AND a.therapist_id = ? 
           AND (p.status = 'completed' OR p.status = 'paid')`,
        [userId, therapistId]
      );

      if ((paidAppointments as any)[0].count === 0) {
        return NextResponse.json(
          { error: 'You can only message therapists for appointments you have paid for' },
          { status: 403 }
        );
      }

      // Insert the message
      const [result] = await connection.execute(
        `INSERT INTO messages (sender_type, sender_id, receiver_type, receiver_id, message_text, message_type, appointment_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sender_type, sender_id, receiver_type, receiver_id, message_text, message_type, appointment_id]
      );

      // Get the created message with sender info
      const [messages] = await connection.execute(
        `SELECT m.*, 
         CASE 
           WHEN m.sender_type = 'user' THEN u.name
           WHEN m.sender_type = 'therapist' THEN t.name
         END as sender_name
         FROM messages m
         LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.user_id
         LEFT JOIN therapists t ON m.sender_type = 'therapist' AND m.sender_id = t.therapist_id
         WHERE m.message_id = ?`,
        [(result as any).insertId]
      );

      return NextResponse.json({ 
        message: 'Message sent successfully',
        data: messages[0]
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}