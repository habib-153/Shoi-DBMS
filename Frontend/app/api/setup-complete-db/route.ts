import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Database Structure Analysis ===');
    
    // Check resources table
    console.log('1. Checking resources table...');
    const resourcesStructure = await query('DESCRIBE resources');
    console.log('Resources table structure:', resourcesStructure);
    
    const resourcesCount = await query('SELECT COUNT(*) as count FROM resources');
    console.log('Resources count:', resourcesCount);
    
    // Check user_resources table
    console.log('2. Checking user_resources table...');
    const userResourcesStructure = await query('DESCRIBE user_resources');
    console.log('User_resources table structure:', userResourcesStructure);
    
    const userResourcesCount = await query('SELECT COUNT(*) as count FROM user_resources');
    console.log('User_resources count:', userResourcesCount);
    
    // Check users table
    console.log('3. Checking users table...');
    const usersStructure = await query('DESCRIBE users');
    console.log('Users table structure:', usersStructure);
    
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    console.log('Users count:', usersCount);
    
    // Check therapists table
    console.log('4. Checking therapists table...');
    const therapistsStructure = await query('DESCRIBE therapists');
    console.log('Therapists table structure:', therapistsStructure);
    
    const therapistsCount = await query('SELECT COUNT(*) as count FROM therapists');
    console.log('Therapists count:', therapistsCount);
    
    // Sample data from each table
    const sampleResources = await query('SELECT * FROM resources LIMIT 3');
    const sampleUsers = await query('SELECT user_id, name, email FROM users LIMIT 3');
    const sampleTherapists = await query('SELECT therapist_id, name, email FROM therapists LIMIT 3');
    const sampleUserResources = await query('SELECT * FROM user_resources LIMIT 3');
    
    return NextResponse.json({
      success: true,
      structures: {
        resources: resourcesStructure,
        user_resources: userResourcesStructure,
        users: usersStructure,
        therapists: therapistsStructure
      },
      counts: {
        resources: (resourcesCount as any)[0].count,
        user_resources: (userResourcesCount as any)[0].count,
        users: (usersCount as any)[0].count,
        therapists: (therapistsCount as any)[0].count
      },
      sampleData: {
        resources: sampleResources,
        users: sampleUsers,
        therapists: sampleTherapists,
        user_resources: sampleUserResources
      }
    });
    
  } catch (error) {
    console.error('Database analysis error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('=== Creating Test Data ===');
    
    // Insert sample resources if none exist
    const resourcesCount = await query('SELECT COUNT(*) as count FROM resources');
    if ((resourcesCount as any)[0].count === 0) {
      console.log('Creating sample resources...');
      await query(`
        INSERT INTO resources (title, type, description, author_or_source, link) VALUES
        ('Anxiety Management Guide', 'PDF Handout', 'Comprehensive guide for managing anxiety disorders', 'Dr. Sarah Johnson', 'https://example.com/anxiety-guide.pdf'),
        ('Mindfulness Meditation Video', 'Video', 'Step-by-step mindfulness meditation for beginners', 'Mindful Institute', 'https://example.com/mindfulness-video'),
        ('Depression Recovery Workbook', 'Workbook', 'Interactive workbook with exercises for depression recovery', 'Mental Health Press', 'https://example.com/depression-workbook.pdf'),
        ('Sleep Hygiene Toolkit', 'Toolkit', 'Complete toolkit for improving sleep patterns and quality', 'Sleep Foundation', 'https://example.com/sleep-toolkit'),
        ('Stress Management Techniques', 'Infographic', 'Visual guide to various stress reduction techniques', 'Psychology Today', 'https://example.com/stress-infographic.pdf')
      `);
    }
    
    // Insert sample users if none exist
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    if ((usersCount as any)[0].count === 0) {
      console.log('Creating sample users...');
      await query(`
        INSERT INTO users (name, email, phone, password, date_of_birth, gender) VALUES
        ('John Smith', 'john.smith@email.com', '+1234567890', 'hashed_password', '1990-05-15', 'Male'),
        ('Jane Doe', 'jane.doe@email.com', '+0987654321', 'hashed_password', '1985-08-20', 'Female')
      `);
    }
    
    // Insert sample therapists if none exist
    const therapistsCount = await query('SELECT COUNT(*) as count FROM therapists');
    if ((therapistsCount as any)[0].count === 0) {
      console.log('Creating sample therapists...');
      await query(`
        INSERT INTO therapists (name, email, phone, password, specialization, experience_years, license_number, qualification, bio) VALUES
        ('Dr. Emily Carter', 'emily.carter@therapy.com', '+1234567890', 'hashed_password', 'Anxiety, Depression', 8, 'LIC123456', 'PhD in Clinical Psychology', 'Experienced therapist specializing in anxiety and mood disorders.'),
        ('Dr. Michael Rodriguez', 'michael.rodriguez@therapy.com', '+0987654321', 'hashed_password', 'Trauma, PTSD', 10, 'LIC789012', 'PhD in Clinical Psychology', 'Specialist in trauma therapy and PTSD treatment.')
      `);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data created successfully'
    });
    
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
