import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get all resources assigned to this user with therapist information
    const assignedResources = await query(`
      SELECT 
        r.*,
        ur.assigned_at,
        ur.suggested_by,
        t.name as therapist_name,
        t.email as therapist_email
      FROM user_resources ur
      JOIN resources r ON ur.resource_id = r.resource_id
      LEFT JOIN therapists t ON ur.suggested_by = t.therapist_id
      WHERE ur.user_id = ?
      ORDER BY ur.assigned_at DESC
    `, [id]);

    return NextResponse.json({
      success: true,
      resources: assignedResources
    });

  } catch (error) {
    console.error('Error fetching user resources:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch assigned resources',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
