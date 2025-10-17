import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipientType = searchParams.get('recipient_type'); // 'user' or 'therapist'
    const recipientId = searchParams.get('recipient_id');
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!recipientType || !recipientId) {
      return NextResponse.json(
        { success: false, error: 'recipient_type and recipient_id are required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        n.*,
        CASE 
          WHEN n.sender_type = 'therapist' THEN t.name
          WHEN n.sender_type = 'user' THEN u.name
          ELSE 'System'
        END as sender_name
      FROM notifications n
      LEFT JOIN therapists t ON n.sender_type = 'therapist' AND n.sender_id = t.therapist_id
      LEFT JOIN users u ON n.sender_type = 'user' AND n.sender_id = u.user_id
      WHERE n.recipient_type = ? AND n.recipient_id = ?
    `;

    const params: any[] = [recipientType, recipientId];

    if (unreadOnly) {
      sql += ` AND n.is_read = FALSE`;
    }

    sql += ` ORDER BY n.created_at DESC LIMIT ?`;
    params.push(limit);

    const notifications = await query(sql, params);

    // Get unread count
    const unreadCount = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE recipient_type = ? AND recipient_id = ? AND is_read = FALSE`,
      [recipientType, recipientId]
    );

    return NextResponse.json({
      success: true,
      notifications,
      unread_count: unreadCount[0]?.count || 0
    });

  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipient_type,
      recipient_id,
      sender_type,
      sender_id,
      notification_type,
      title,
      message,
      related_id,
      action_url
    } = body;

    if (!recipient_type || !recipient_id || !notification_type || !title || !message) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'recipient_type, recipient_id, notification_type, title, and message are required' 
        },
        { status: 400 }
      );
    }

    // Check recipient's privacy settings for appointment reminders
    if (notification_type === 'appointment') {
      const privacyCheck: any = await query(
        `SELECT appointment_reminders FROM privacy_settings WHERE user_id = ?`,
        [recipient_type === 'user' ? recipient_id : null]
      );
      
      if (privacyCheck.length > 0 && privacyCheck[0].appointment_reminders === 0) {
        return NextResponse.json({
          success: false,
          error: 'User has disabled appointment reminders'
        }, { status: 403 });
      }
    }

    // Get next notification_id
    const maxId: any = await query(
      `SELECT IFNULL(MAX(notification_id), 0) + 1 as next_id FROM notifications`
    );
    const nextNotificationId = maxId[0]?.next_id || 1;

    const result: any = await query(
      `INSERT INTO notifications 
        (notification_id, recipient_type, recipient_id, sender_type, sender_id, notification_type, 
         title, message, related_id, action_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        nextNotificationId,
        recipient_type,
        recipient_id,
        sender_type || 'system',
        sender_id || null,
        notification_type,
        title,
        message,
        related_id || null,
        action_url || null
      ]
    );

    return NextResponse.json({
      success: true,
      notification_id: nextNotificationId,
      message: 'Notification created successfully'
    });

  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_ids, recipient_type, recipient_id, mark_all } = body;

    if (mark_all) {
      // Mark all notifications as read for this user
      if (!recipient_type || !recipient_id) {
        return NextResponse.json(
          { success: false, error: 'recipient_type and recipient_id required for mark_all' },
          { status: 400 }
        );
      }

      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE recipient_type = ? AND recipient_id = ? AND is_read = FALSE`,
        [recipient_type, recipient_id]
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else {
      // Mark specific notifications as read
      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return NextResponse.json(
          { success: false, error: 'notification_ids array is required' },
          { status: 400 }
        );
      }

      const placeholders = notification_ids.map(() => '?').join(',');
      await query(
        `UPDATE notifications 
         SET is_read = TRUE, read_at = NOW() 
         WHERE notification_id IN (${placeholders})`,
        notification_ids
      );

      return NextResponse.json({
        success: true,
        message: 'Notifications marked as read'
      });
    }

  } catch (error: any) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark notifications as read', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete notifications
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('notification_id');
    const recipientType = searchParams.get('recipient_type');
    const recipientId = searchParams.get('recipient_id');
    const deleteAll = searchParams.get('delete_all') === 'true';

    if (deleteAll) {
      // Delete all read notifications for this user
      if (!recipientType || !recipientId) {
        return NextResponse.json(
          { success: false, error: 'recipient_type and recipient_id required for delete_all' },
          { status: 400 }
        );
      }

      await query(
        `DELETE FROM notifications 
         WHERE recipient_type = ? AND recipient_id = ? AND is_read = TRUE`,
        [recipientType, recipientId]
      );

      return NextResponse.json({
        success: true,
        message: 'All read notifications deleted'
      });
    } else if (notificationId) {
      // Delete specific notification
      await query(
        `DELETE FROM notifications WHERE notification_id = ?`,
        [notificationId]
      );

      return NextResponse.json({
        success: true,
        message: 'Notification deleted'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'notification_id or delete_all parameter required' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications', details: error.message },
      { status: 500 }
    );
  }
}
