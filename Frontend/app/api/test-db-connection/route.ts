import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Testing Database Tables ===');
    
    // Test 1: Check if tables exist
    const tables = await query("SHOW TABLES LIKE 'user_resources'");
    console.log('user_resources table exists:', tables.length > 0);
    
    if (tables.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'user_resources table does not exist'
      });
    }

    // Test 2: Check table structure
    const structure = await query('DESCRIBE user_resources');
    console.log('user_resources structure:', structure);

    // Test 3: Check if we can insert a simple test record using actual table structure
    try {
      const testResult = await query(
        `INSERT INTO user_resources (user_id, resource_id, assigned_at, suggested_by)
         VALUES (1, 1, CURDATE(), 1)`
      );
      console.log('Test insert successful:', testResult);
      
      // Clean up test record
      await query('DELETE FROM user_resources WHERE user_id = 1 AND resource_id = 1');
      
    } catch (insertError) {
      console.error('Insert test failed:', insertError);
      return NextResponse.json({
        success: false,
        error: `Insert test failed: ${insertError}`,
        structure: structure
      });
    }

    // Test 4: Check related tables
    const resourcesCount = await query('SELECT COUNT(*) as count FROM resources');
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    const therapistsCount = await query('SELECT COUNT(*) as count FROM therapists');

    return NextResponse.json({
      success: true,
      message: 'All tests passed',
      tableStructure: structure,
      counts: {
        resources: (resourcesCount as any)[0].count,
        users: (usersCount as any)[0].count,
        therapists: (therapistsCount as any)[0].count
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: `Database test failed: ${error}`
    }, { status: 500 });
  }
}