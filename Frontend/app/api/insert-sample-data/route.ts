import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    // Insert sample resources
    const sampleResources = [
      {
        title: 'Quick Handout: Perinatal Mental Health',
        type: 'PDF Handout',
        description: 'Perinatal Mental Health pdf handout including tracking sheets, do\'s and don\'ts, clinically-informed tips.',
        author_or_source: 'Bushra Jahan, M.Phil',
        link: 'https://example.com/perinatal-mental-health.pdf'
      },
      {
        title: 'Infographic on Parenting Stress',
        type: 'Infographic',
        description: 'Parenting Stress infographic including step-by-step strategies, tracking sheets, evidence-based methods.',
        author_or_source: 'Psychology Today',
        link: 'https://example.com/parenting-stress-infographic.pdf'
      },
      {
        title: 'How to Practice Perinatal Mental Health',
        type: 'Video',
        description: 'Perinatal Mental Health video including emergency resources, reflection prompts, tracking sheets.',
        author_or_source: 'Dr. Tahmid Rahman, MD',
        link: 'https://example.com/perinatal-mental-health-video'
      },
      {
        title: 'Talking About Suicidal Ideation Support',
        type: 'Podcast',
        description: 'Suicidal Ideation Support podcast including step-by-step strategies, practical exercises, do\'s and don\'ts.',
        author_or_source: 'Bangladesh Psychological Association',
        link: 'https://example.com/suicidal-ideation-podcast'
      },
      {
        title: 'Workbook on Suicidal Ideation Support',
        type: 'Workbook',
        description: 'Suicidal Ideation Support workbook including home practice templates, tracking sheets, clinically-informed tips.',
        author_or_source: 'BetterSleep',
        link: 'https://example.com/suicidal-ideation-workbook.pdf'
      }
    ];

    for (const resource of sampleResources) {
      // Check if resource already exists
      const existing = await query(
        'SELECT resource_id FROM resources WHERE title = ?',
        [resource.title]
      );

      if ((existing as any[]).length === 0) {
        await query(
          `INSERT INTO resources (title, type, description, author_or_source, link, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [resource.title, resource.type, resource.description, resource.author_or_source, resource.link]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample resources created successfully'
    });

  } catch (error) {
    console.error('Error creating sample resources:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}