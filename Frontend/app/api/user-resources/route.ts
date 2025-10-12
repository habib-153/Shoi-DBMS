import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch user resources with relationships
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const resourceId = searchParams.get('resourceId');
    const suggestedBy = searchParams.get('suggested_by');

    let sql = `
      SELECT 
        ur.user_id,
        ur.resource_id,
        ur.assigned_at,
        ur.suggested_by,
        u.name as user_name,
        u.email as user_email,
        r.title as resource_title,
        r.description as resource_description,
        r.type as resource_type,
        r.link as resource_url,
        r.author_or_source,
        t.name as suggested_by_therapist
      FROM user_resources ur
      JOIN users u ON ur.user_id = u.user_id
      JOIN resources r ON ur.resource_id = r.resource_id
      LEFT JOIN therapists t ON ur.suggested_by = t.therapist_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (userId) {
      sql += ` AND ur.user_id = ?`;
      params.push(userId);
    }

    if (resourceId) {
      sql += ` AND ur.resource_id = ?`;
      params.push(resourceId);
    }

    if (suggestedBy) {
      sql += ` AND ur.suggested_by = ?`;
      params.push(suggestedBy);
    }

    sql += ` ORDER BY ur.assigned_at DESC`;

    const userResources = await query(sql, params);

    return NextResponse.json({
      success: true,
      user_resources: userResources
    });

  } catch (error) {
    console.error('Error fetching user resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user resources' },
      { status: 500 }
    );
  }
}

// POST - Assign resource to user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, resource_id, suggested_by } = body;

    if (!user_id || !resource_id) {
      return NextResponse.json(
        { success: false, error: 'User ID and Resource ID are required' },
        { status: 400 }
      );
    }

    // Check if resource already assigned to user
    const existingAssignment = await query(
      'SELECT * FROM user_resources WHERE user_id = ? AND resource_id = ?',
      [user_id, resource_id]
    );

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Resource already assigned to this user' },
        { status: 409 }
      );
    }

    // Assign resource to user
    console.log('Attempting to insert:', {
      user_id,
      resource_id,
      suggested_by: suggested_by || null
    });
    
    const result: any = await query(
      `INSERT INTO user_resources (user_id, resource_id, assigned_at, suggested_by)
       VALUES (?, ?, CURDATE(), ?)`,
      [user_id, resource_id, suggested_by || null]
    );
    
    console.log('Insert result:', result);

    return NextResponse.json({
      success: true,
      message: 'Resource assigned to user successfully',
      user_resource_id: result.insertId || result[0]?.insertId
    });

  } catch (error) {
    console.error('Error assigning resource:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: `Failed to assign resource: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// DELETE - Remove resource assignment from user
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, resource_id } = body;

    if (!user_id || !resource_id) {
      return NextResponse.json(
        { success: false, error: 'User ID and Resource ID are required' },
        { status: 400 }
      );
    }

    await query(
      'DELETE FROM user_resources WHERE user_id = ? AND resource_id = ?',
      [user_id, resource_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Resource assignment removed successfully'
    });

  } catch (error) {
    console.error('Error removing resource assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove resource assignment' },
      { status: 500 }
    );
  }
}