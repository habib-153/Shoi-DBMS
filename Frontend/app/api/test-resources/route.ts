import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // First, let's insert some test resources if none exist
    const existingResources = await query('SELECT COUNT(*) as count FROM resources');
    const count = (existingResources as any)[0].count;
    
    if (count === 0) {
      // Insert test resources
      await query(`
        INSERT INTO resources (title, type, description, author_or_source, link) VALUES
        ('Anxiety Management Guide', 'PDF Handout', 'Comprehensive guide for managing anxiety with practical exercises', 'Dr. Sarah Johnson', 'https://example.com/anxiety-guide.pdf'),
        ('Mindfulness Meditation Video', 'Video', 'Step-by-step mindfulness meditation for beginners', 'Mindful Institute', 'https://example.com/mindfulness-video'),
        ('Depression Recovery Workbook', 'Workbook', 'Interactive workbook with exercises for depression recovery', 'Mental Health Press', 'https://example.com/depression-workbook.pdf'),
        ('Sleep Hygiene Toolkit', 'Toolkit', 'Complete toolkit for improving sleep patterns and quality', 'Sleep Foundation', 'https://example.com/sleep-toolkit'),
        ('Stress Management Techniques', 'Infographic', 'Visual guide to various stress reduction techniques', 'Psychology Today', 'https://example.com/stress-infographic.pdf')
      `);
    }
    
    // Now fetch all resources
    const resources = await query('SELECT * FROM resources ORDER BY created_at DESC');
    
    return NextResponse.json({
      success: true,
      message: 'Resources fetched successfully',
      count: resources.length,
      resources
    });

  } catch (error) {
    console.error('Error in test resources:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Create a test assignment using actual table structure
    const result = await query(`
      INSERT INTO user_resources (user_id, resource_id, suggested_by, assigned_at)
      VALUES (1, 1, 1, CURDATE())
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Test assignment created',
      result
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}