import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
};

// GET - Fetch family members for a user
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const connection = await mysql.createConnection(dbConfig);

    const [familyMembers] = await connection.execute(
      `SELECT family_id, user_id, name, relation, contact
       FROM family_members 
       WHERE user_id = ?
       ORDER BY family_id DESC`,
      [id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      family_members: familyMembers
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch family members' },
      { status: 500 }
    );
  }
}

// POST - Add a new family member
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, relation, contact } = body;

    if (!name || !relation) {
      return NextResponse.json(
        { success: false, error: 'Name and relation are required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    // Get max family_id and add 1
    const [maxResult] = await connection.execute(
      'SELECT IFNULL(MAX(family_id), 0) + 1 as next_id FROM family_members'
    ) as any;
    const familyId = maxResult[0].next_id;

    await connection.execute(
      `INSERT INTO family_members (family_id, user_id, name, relation, contact) 
       VALUES (?, ?, ?, ?, ?)`,
      [familyId, id, name, relation, contact || null]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Family member added successfully',
      family_id: familyId
    });
  } catch (error) {
    console.error('Error adding family member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add family member' },
      { status: 500 }
    );
  }
}

// PUT - Update a family member
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { family_id, name, relation, contact } = body;

    if (!family_id || !name || !relation) {
      return NextResponse.json(
        { success: false, error: 'Family ID, name and relation are required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `UPDATE family_members 
       SET name = ?, relation = ?, contact = ?
       WHERE family_id = ? AND user_id = ?`,
      [name, relation, contact || null, family_id, id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Family member updated successfully'
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update family member' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a family member
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const familyId = searchParams.get('family_id');

    if (!familyId) {
      return NextResponse.json(
        { success: false, error: 'Family ID is required' },
        { status: 400 }
      );
    }

    const connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      'DELETE FROM family_members WHERE family_id = ? AND user_id = ?',
      [familyId, id]
    );

    await connection.end();

    return NextResponse.json({
      success: true,
      message: 'Family member removed successfully'
    });
  } catch (error) {
    console.error('Error removing family member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove family member' },
      { status: 500 }
    );
  }
}
