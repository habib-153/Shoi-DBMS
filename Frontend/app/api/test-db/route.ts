import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Test basic database connection
    const tables = await query("SHOW TABLES LIKE 'resources'");
    console.log('Resources table check:', tables);
    
    // Check if resources exist
    const resourceCount = await query('SELECT COUNT(*) as count FROM resources');
    console.log('Resource count:', resourceCount);
    
    // If no resources, create some
    if ((resourceCount as any)[0].count === 0) {
      await query(`
        INSERT INTO resources (title, type, description, author_or_source, link, created_at) VALUES
        ('Anxiety Management Techniques', 'PDF Handout', 'Learn effective techniques to manage anxiety in daily life', 'Dr. Sarah Johnson', 'https://example.com/anxiety-management', NOW()),
        ('Mindfulness Meditation Guide', 'Video', 'A comprehensive guide to mindfulness meditation for beginners', 'Mindful Living Institute', 'https://example.com/mindfulness-guide', NOW()),
        ('Depression Recovery Workbook', 'Workbook', 'Interactive workbook with exercises for depression recovery', 'Mental Health Press', 'https://example.com/depression-workbook', NOW()),
        ('Sleep Hygiene Checklist', 'Toolkit', 'Daily checklist to improve sleep quality and patterns', 'Sleep Foundation', 'https://example.com/sleep-checklist', NOW()),
        ('Stress Reduction Exercises', 'Infographic', 'Physical and mental exercises to reduce stress levels', 'Wellness Center', 'https://example.com/stress-exercises', NOW())
      `);
      console.log('Sample resources created');
    }
    
    // Fetch all resources
    const resources = await query('SELECT * FROM resources ORDER BY created_at DESC');
    
    return NextResponse.json({
      success: true,
      message: 'Database test successful',
      resourceCount: resources.length,
      resources: resources
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

// Test assignment
export async function POST() {
  try {
    // Create a test user-resource assignment using actual table structure
    const result = await query(`
      INSERT IGNORE INTO user_resources (user_id, resource_id, suggested_by, assigned_at)
      SELECT 1, r.resource_id, 1, CURDATE()
      FROM resources r
      LIMIT 1
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Test assignment created',
      insertId: (result as any).insertId
    });
    
  } catch (error) {
    console.error('Test assignment error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}