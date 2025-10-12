import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch shared items for a user or family member
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const familyId = searchParams.get('familyId');
    const itemType = searchParams.get('itemType');

    if (!userId && !familyId) {
      return NextResponse.json(
        { success: false, error: 'Either userId or familyId is required' },
        { status: 400 }
      );
    }

    let sql = `
      SELECT 
        si.share_id,
        si.user_id,
        si.family_id,
        si.item_type,
        si.ref_id,
        si.shared_at,
        fm.name as family_member_name,
        fm.relation,
        u.name as user_name
      FROM shared_items si
      JOIN family_members fm ON si.family_id = fm.family_id
      JOIN users u ON si.user_id = u.user_id
    `;

    const params: any[] = [];

    if (userId) {
      sql += ` WHERE si.user_id = ?`;
      params.push(userId);
    } else if (familyId) {
      sql += ` WHERE si.family_id = ?`;
      params.push(familyId);
    }

    if (itemType) {
      sql += params.length > 0 ? ` AND si.item_type = ?` : ` WHERE si.item_type = ?`;
      params.push(itemType);
    }

    sql += ` ORDER BY si.shared_at DESC`;

    const sharedItems = await query(sql, params);

    return NextResponse.json({
      success: true,
      shared_items: sharedItems
    });

  } catch (error) {
    console.error('Error fetching shared items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shared items' },
      { status: 500 }
    );
  }
}

// POST - Share an item with family member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, family_id, item_type, ref_id } = body;

    if (!user_id || !family_id || !item_type || !ref_id) {
      return NextResponse.json(
        { success: false, error: 'User ID, Family ID, Item Type, and Reference ID are required' },
        { status: 400 }
      );
    }

    // Verify that the family member belongs to the user
    const familyMember = await query(
      'SELECT * FROM family_members WHERE family_id = ? AND user_id = ? AND can_view_progress = 1',
      [family_id, user_id]
    );

    if (familyMember.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Family member not found or not authorized to view progress' },
        { status: 403 }
      );
    }

    // Check if already shared
    const existing = await query(
      'SELECT * FROM shared_items WHERE user_id = ? AND family_id = ? AND item_type = ? AND ref_id = ?',
      [user_id, family_id, item_type, ref_id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Item already shared with this family member' },
        { status: 409 }
      );
    }

    const result = await query(
      `INSERT INTO shared_items (user_id, family_id, item_type, ref_id)
       VALUES (?, ?, ?, ?)`,
      [user_id, family_id, item_type, ref_id]
    );

    return NextResponse.json({
      success: true,
      share_id: (result as any).insertId,
      message: 'Item shared successfully'
    });

  } catch (error) {
    console.error('Error sharing item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to share item' },
      { status: 500 }
    );
  }
}

// DELETE - Remove shared item
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { share_id, user_id } = body;

    if (!share_id || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Share ID and User ID are required' },
        { status: 400 }
      );
    }

    // Verify ownership before deleting
    const result = await query(
      'DELETE FROM shared_items WHERE share_id = ? AND user_id = ?',
      [share_id, user_id]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Shared item not found or not authorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shared item removed successfully'
    });

  } catch (error) {
    console.error('Error removing shared item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove shared item' },
      { status: 500 }
    );
  }
}