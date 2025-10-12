import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Fetch all available symptoms
export async function GET() {
  try {
    const symptoms = await query(`
      SELECT 
        symptom_id,
        symptom_name_bn,
        symptom_name_en,
        description_bn,
        description_en
      FROM symptoms
      ORDER BY symptom_name_en
    `);

    return NextResponse.json({
      success: true,
      symptoms
    });

  } catch (error) {
    console.error('Error fetching symptoms:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch symptoms' },
      { status: 500 }
    );
  }
}

// POST - Create new symptom
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptom_name_bn, symptom_name_en, description_bn, description_en } = body;

    if (!symptom_name_en && !symptom_name_bn) {
      return NextResponse.json(
        { success: false, error: 'At least one symptom name (English or Bengali) is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO symptoms (symptom_name_bn, symptom_name_en, description_bn, description_en)
       VALUES (?, ?, ?, ?)`,
      [symptom_name_bn || null, symptom_name_en || null, description_bn || null, description_en || null]
    );

    return NextResponse.json({
      success: true,
      symptom_id: (result as any).insertId,
      message: 'Symptom created successfully'
    });

  } catch (error) {
    console.error('Error creating symptom:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create symptom' },
      { status: 500 }
    );
  }
}