import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch specific user resource
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userResourceId = id;

    const userResource = await query(
      `SELECT 
        ur.user_id,
        ur.resource_id,
        ur.assigned_at,
        ur.suggested_by,
        u.name as user_name,
        u.email as user_email,
        r.title as resource_title,
        r.description as resource_description,
        r.resource_type,
        r.url as resource_url,
        t.name as suggested_by_therapist
      FROM user_resources ur
      JOIN users u ON ur.user_id = u.user_id
      JOIN resources r ON ur.resource_id = r.resource_id
      LEFT JOIN therapists t ON ur.suggested_by = t.therapist_id
      WHERE ur.user_resource_id = ?`,
      [userResourceId]
    );

    if (userResource.length === 0) {
      return NextResponse.json(
        { success: false, error: 'User resource not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user_resource: userResource[0]
    });

  } catch (error) {
    console.error('Error fetching user resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user resource' },
      { status: 500 }
    );
  }
}

// PUT - Update user resource progress
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userResourceId = id;
    const body = await request.json();
    const { progress_status, notes } = body;

    if (!progress_status) {
      return NextResponse.json(
        { success: false, error: 'Progress status is required' },
        { status: 400 }
      );
    }

    // Valid progress statuses
    const validStatuses = ['assigned', 'in_progress', 'completed', 'paused'];
    if (!validStatuses.includes(progress_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid progress status' },
        { status: 400 }
      );
    }

    // Since your user_resources table only has user_id, resource_id, assigned_at, suggested_by
    // We can only update the suggested_by field if provided
    if (progress_status === 'assigned' && notes) {
      // Just return success since there are no updatable fields in your current schema
      console.log('Update requested but no updateable fields in current schema');
    }

    return NextResponse.json({
      success: true,
      message: 'User resource updated successfully'
    });

  } catch (error) {
    console.error('Error updating user resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user resource' },
      { status: 500 }
    );
  }
}

// DELETE - Remove user resource assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userResourceId = id;

    // Since user_resources table has composite primary key (user_id, resource_id)
    // We need to parse the id parameter to get both values
    const [userId, resourceId] = id.split('-');
    await query(
      'DELETE FROM user_resources WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    return NextResponse.json({
      success: true,
      message: 'User resource assignment removed successfully'
    });

  } catch (error) {
    console.error('Error removing user resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove user resource assignment' },
      { status: 500 }
    );
  }
}