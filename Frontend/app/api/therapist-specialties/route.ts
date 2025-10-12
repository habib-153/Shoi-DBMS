import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Assign specialty to therapist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapist_id, specialty_id } = body;

    if (!therapist_id || !specialty_id) {
      return NextResponse.json(
        { success: false, error: 'Therapist ID and Specialty ID are required' },
        { status: 400 }
      );
    }

    // Verify therapist exists
    const therapist = await query(
      'SELECT * FROM therapists WHERE therapist_id = ?',
      [therapist_id]
    );

    if (therapist.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Therapist not found' },
        { status: 404 }
      );
    }

    // Verify specialty exists
    const specialty = await query(
      'SELECT * FROM specialties WHERE specialty_id = ?',
      [specialty_id]
    );

    if (specialty.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Specialty not found' },
        { status: 404 }
      );
    }

    // Check if relationship already exists
    const existing = await query(
      'SELECT * FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapist_id, specialty_id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Therapist already has this specialty' },
        { status: 409 }
      );
    }

    // Create relationship
    await query(
      'INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (?, ?)',
      [therapist_id, specialty_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Specialty assigned to therapist successfully'
    });

  } catch (error) {
    console.error('Error assigning specialty to therapist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign specialty to therapist' },
      { status: 500 }
    );
  }
}

// DELETE - Remove specialty from therapist
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { therapist_id, specialty_id } = body;

    if (!therapist_id || !specialty_id) {
      return NextResponse.json(
        { success: false, error: 'Therapist ID and Specialty ID are required' },
        { status: 400 }
      );
    }

    // Check if relationship exists
    const existing = await query(
      'SELECT * FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapist_id, specialty_id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Therapist specialty relationship not found' },
        { status: 404 }
      );
    }

    // Remove relationship
    await query(
      'DELETE FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapist_id, specialty_id]
    );

    return NextResponse.json({
      success: true,
      message: 'Specialty removed from therapist successfully'
    });

  } catch (error) {
    console.error('Error removing specialty from therapist:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove specialty from therapist' },
      { status: 500 }
    );
  }
}

// GET - Get all therapist-specialty relationships
export async function GET(request: NextRequest) {
  try {
    const relationships = await query(`
      SELECT 
        ts.therapist_id,
        ts.specialty_id,
        t.name as therapist_name,
        t.email as therapist_email,
        s.specialty_name,
        s.description as specialty_description
      FROM therapist_specialties ts
      JOIN therapists t ON ts.therapist_id = t.therapist_id
      JOIN specialties s ON ts.specialty_id = s.specialty_id
      ORDER BY t.name, s.specialty_name
    `);

    return NextResponse.json({
      success: true,
      relationships
    });

  } catch (error) {
    console.error('Error fetching therapist-specialty relationships:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch relationships' },
      { status: 500 }
    );
  }
}