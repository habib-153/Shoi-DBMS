import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, resourceId, suggestedBy } = body;
    
    console.log('=== DIRECT ASSIGNMENT API ===');
    console.log('Received data:', { userId, resourceId, suggestedBy });
    
    // Validate required fields
    if (!userId || !resourceId) {
      return NextResponse.json({
        success: false,
        error: 'userId and resourceId are required'
      }, { status: 400 });
    }
    
    // Check if assignment already exists
    const existingAssignment = await query(
      'SELECT * FROM user_resources WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );
    
    if ((existingAssignment as any[]).length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Resource already assigned to this user'
      }, { status: 409 });
    }
    
    // Verify the resource exists
    const resourceCheck = await query(
      'SELECT * FROM resources WHERE resource_id = ?',
      [resourceId]
    );
    
    if ((resourceCheck as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Resource not found'
      }, { status: 404 });
    }
    
    // Verify the user exists
    const userCheck = await query(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if ((userCheck as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    // If suggestedBy is provided, verify the therapist exists
    if (suggestedBy) {
      const therapistCheck = await query(
        'SELECT * FROM therapists WHERE therapist_id = ?',
        [suggestedBy]
      );
      
      if ((therapistCheck as any[]).length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Therapist not found'
        }, { status: 404 });
      }
    }
    
    // Insert the assignment using your actual table structure
    const insertResult = await query(
      `INSERT INTO user_resources (user_id, resource_id, assigned_at, suggested_by)
       VALUES (?, ?, CURDATE(), ?)`,
      [userId, resourceId, suggestedBy]
    );
    
    console.log('Assignment successful:', insertResult);
    
    // Get the assigned resource details
    const assignedResource = await query(`
      SELECT r.*, ur.assigned_at, ur.suggested_by,
             t.name as therapist_name
      FROM user_resources ur
      JOIN resources r ON ur.resource_id = r.resource_id
      LEFT JOIN therapists t ON ur.suggested_by = t.therapist_id
      WHERE ur.user_id = ? AND ur.resource_id = ?
    `, [userId, resourceId]);
    
    return NextResponse.json({
      success: true,
      message: 'Resource assigned successfully',
      assignment: (assignedResource as any[])[0]
    });
    
  } catch (error) {
    console.error('Direct assignment error:', error);
    return NextResponse.json({
      success: false,
      error: 'Assignment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}