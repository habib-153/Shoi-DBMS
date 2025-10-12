import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST() {
  try {
    console.log('=== DEBUGGING RESOURCE ASSIGNMENT ===');
    
    // Step 1: Check database connection
    console.log('Step 1: Testing database connection...');
    const testQuery = await query('SELECT 1 as test');
    console.log('Database connection: OK');
    
    // Step 2: Check if user_resources table exists
    console.log('Step 2: Checking user_resources table...');
    try {
      const userResourcesCheck = await query('SELECT COUNT(*) as count FROM user_resources');
      console.log('user_resources table exists, count:', (userResourcesCheck as any)[0].count);
    } catch (tableError) {
      console.log('user_resources table error:', tableError);
      // Note: Your existing user_resources table structure has:
      // user_id (PRIMARY KEY), resource_id (PRIMARY KEY), assigned_at (DATE), suggested_by (INT)
      // We'll work with the existing structure instead of creating new columns
      console.log('Using existing user_resources table structure');
    }
    
    // Step 3: Check other required tables
    console.log('Step 3: Checking other tables...');
    
    // Create resources table if needed
    try {
      await query('SELECT COUNT(*) FROM resources');
    } catch {
      await query(`
        CREATE TABLE IF NOT EXISTS resources (
          resource_id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          type VARCHAR(100),
          description TEXT,
          author_or_source VARCHAR(255),
          link VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('resources table created');
    }
    
    // Create users table if needed
    try {
      await query('SELECT COUNT(*) FROM users');
    } catch {
      await query(`
        CREATE TABLE IF NOT EXISTS users (
          user_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          password VARCHAR(255),
          date_of_birth DATE,
          gender VARCHAR(10),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('users table created');
    }
    
    // Create therapists table if needed
    try {
      await query('SELECT COUNT(*) FROM therapists');
    } catch {
      await query(`
        CREATE TABLE IF NOT EXISTS therapists (
          therapist_id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          password VARCHAR(255),
          specialization TEXT,
          experience_years INT,
          license_number VARCHAR(100),
          qualification VARCHAR(255),
          bio TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('therapists table created');
    }
    
    // Step 4: Insert test data
    console.log('Step 4: Inserting test data...');
    
    // Insert test resource
    try {
      const existingResources = await query('SELECT COUNT(*) as count FROM resources');
      if ((existingResources as any)[0].count === 0) {
        await query(`
          INSERT INTO resources (title, type, description, author_or_source, link) VALUES
          ('Test Resource', 'PDF', 'Test resource description', 'Test Author', 'https://example.com/test.pdf')
        `);
        console.log('Test resource inserted');
      }
    } catch (resourceError) {
      console.log('Resource insert error:', resourceError);
    }
    
    // Insert test user
    try {
      const existingUsers = await query('SELECT COUNT(*) as count FROM users');
      if ((existingUsers as any)[0].count === 0) {
        await query(`
          INSERT INTO users (name, email, phone, password) VALUES
          ('Test User', 'test@example.com', '1234567890', 'password')
        `);
        console.log('Test user inserted');
      }
    } catch (userError) {
      console.log('User insert error:', userError);
    }
    
    // Insert test therapist
    try {
      const existingTherapists = await query('SELECT COUNT(*) as count FROM therapists');
      if ((existingTherapists as any)[0].count === 0) {
        await query(`
          INSERT INTO therapists (name, email, phone, password, specialization) VALUES
          ('Test Therapist', 'therapist@example.com', '0987654321', 'password', 'General')
        `);
        console.log('Test therapist inserted');
      }
    } catch (therapistError) {
      console.log('Therapist insert error:', therapistError);
    }
    
    // Step 5: Test assignment using actual table structure
    console.log('Step 5: Testing resource assignment...');
    const assignmentResult = await query(
      `INSERT INTO user_resources (user_id, resource_id, assigned_at, suggested_by)
       VALUES (1, 1, CURDATE(), 1)`
    );
    console.log('Test assignment successful:', assignmentResult);
    
    // Clean up test assignment
    await query(`DELETE FROM user_resources WHERE user_id = 1 AND resource_id = 1`);
    
    return NextResponse.json({
      success: true,
      message: 'All database setup and tests completed successfully!'
    });
    
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}