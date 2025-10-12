import { query } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET - Get specialties for a therapist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;

    const specialties = await query(`
      SELECT 
        s.specialty_id,
        s.specialty_name,
        s.description,
        ts.therapist_id
      FROM therapist_specialties ts
      JOIN specialties s ON ts.specialty_id = s.specialty_id
      WHERE ts.therapist_id = ?
    `, [therapistId]);

    return NextResponse.json({
      success: true,
      specialties
    });
  } catch (error) {
    console.error("Error fetching therapist specialties:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch specialties"
    }, { status: 500 });
  }
}

// POST - Add specialty to therapist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;
    const body = await request.json();
    const { specialty_id } = body;

    if (!specialty_id) {
      return NextResponse.json(
        { success: false, error: 'Specialty ID is required' },
        { status: 400 }
      );
    }

    // Check if relationship already exists
    const existing = await query(
      'SELECT * FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapistId, specialty_id]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Therapist already has this specialty' },
        { status: 409 }
      );
    }

    // Add specialty to therapist
    await query(
      'INSERT INTO therapist_specialties (therapist_id, specialty_id) VALUES (?, ?)',
      [therapistId, specialty_id]
    );

    return NextResponse.json({
      success: true,
      message: "Specialty added to therapist successfully"
    });
  } catch (error) {
    console.error("Error adding specialty to therapist:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to add specialty"
    }, { status: 500 });
  }
}

// DELETE - Remove specialty from therapist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const therapistId = id;
    const { searchParams } = new URL(request.url);
    const specialtyId = searchParams.get('specialty_id');

    if (!specialtyId) {
      return NextResponse.json(
        { success: false, error: 'Specialty ID is required' },
        { status: 400 }
      );
    }

    await query(
      'DELETE FROM therapist_specialties WHERE therapist_id = ? AND specialty_id = ?',
      [therapistId, specialtyId]
    );

    return NextResponse.json({
      success: true,
      message: "Specialty removed from therapist successfully"
    });
  } catch (error) {
    console.error("Error removing specialty from therapist:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to remove specialty"
    }, { status: 500 });
  }
}