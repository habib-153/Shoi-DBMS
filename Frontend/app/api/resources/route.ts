import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all resources or filtered by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userId = searchParams.get('userId');

    let sql = `
      SELECT 
        r.resource_id,
        r.title,
        r.type,
        r.author_or_source,
        r.description,
        r.link,
        r.created_at
      FROM resources r
    `;
    
    const params: any[] = [];

    if (type) {
      sql += ' WHERE r.type = ?';
      params.push(type);
    }

    // If userId is provided, also check if user has this resource assigned
    if (userId) {
      sql = `
        SELECT 
          r.resource_id,
          r.title,
          r.type,
          r.author_or_source,
          r.description,
          r.link,
          r.created_at,
          ur.assigned_at,
          ur.suggested_by,
          t.name as suggested_by_name
        FROM resources r
        LEFT JOIN user_resources ur ON r.resource_id = ur.resource_id AND ur.user_id = ?
        LEFT JOIN therapists t ON ur.suggested_by = t.therapist_id
      `;
      params.unshift(userId);
      
      if (type) {
        sql += ' WHERE r.type = ?';
        params.push(type);
      }
    }

    sql += ' ORDER BY r.created_at DESC';

    const resources = await query(sql, params);

    return NextResponse.json({
      success: true,
      resources
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resources' },
      { status: 500 }
    );
  }
}

// POST - Create new resource
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, type, author_or_source, description, link } = body;

    if (!title || !type) {
      return NextResponse.json(
        { success: false, error: 'Title and type are required' },
        { status: 400 }
      );
    }

    // Get next resource_id (manual ID generation)
    const maxIdResult: any = await query(
      `SELECT MAX(resource_id) as max_id FROM resources`
    );
    const currentMaxId = maxIdResult[0]?.max_id || 0;
    const next_resource_id = currentMaxId + 1;

    const result = await query(
      `INSERT INTO resources (resource_id, title, type, author_or_source, description, link)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [next_resource_id, title, type, author_or_source || null, description || null, link || null]
    );

    return NextResponse.json({
      success: true,
      resource_id: next_resource_id,
      message: 'Resource created successfully'
    });

  } catch (error) {
    console.error('Error creating resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resource' },
      { status: 500 }
    );
  }
}