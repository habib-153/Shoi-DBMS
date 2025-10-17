import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get privacy settings for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const settings: any[] = await query(
      `SELECT * FROM privacy_settings WHERE user_id = ?`,
      [id]
    );

    if (settings.length === 0) {
      // Get next setting_id
      const maxIdResult: any = await query(
        `SELECT MAX(setting_id) as max_id FROM privacy_settings`
      );
      const currentMaxId = maxIdResult[0]?.max_id || 0;
      const next_setting_id = currentMaxId + 1;

      // Create default privacy settings if they don't exist
      await query(
        `INSERT INTO privacy_settings (setting_id, user_id) VALUES (?, ?)`,
        [next_setting_id, id]
      );

      const newSettings: any[] = await query(
        `SELECT * FROM privacy_settings WHERE user_id = ?`,
        [id]
      );

      return NextResponse.json({
        success: true,
        settings: newSettings[0]
      });
    }

    return NextResponse.json({
      success: true,
      settings: settings[0]
    });

  } catch (error: any) {
    console.error('Error fetching privacy settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch privacy settings',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Update privacy settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Remove user_id, setting_id, and timestamps from update (MySQL handles these automatically)
    const { user_id, setting_id, created_at, updated_at, ...updateFields } = body;

    // Build update query dynamically
    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');

    await query(
      `UPDATE privacy_settings SET ${setClause} WHERE user_id = ?`,
      [...values, id]
    );

    // Skip activity logging if table doesn't exist
    // (Optional feature - not essential for privacy settings to work)

    // Fetch updated settings
    const updated: any[] = await query(
      `SELECT * FROM privacy_settings WHERE user_id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
      settings: updated[0]
    });

  } catch (error: any) {
    console.error('Error updating privacy settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update privacy settings',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
