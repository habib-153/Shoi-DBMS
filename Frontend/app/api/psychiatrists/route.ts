import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - Get all psychiatrists available for referrals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get('include_all') === 'true';

    // Query psychiatrists using therapist_specialties join with specialty_id = 2
    let sql = `
      SELECT 
        t.therapist_id,
        t.name,
        t.email,
        t.gender,
        t.license_no,
        t.years_experience,
        t.rating,
        t.bio,
        t.educational_info,
        t.fees_min,
        t.fees_max,
        t.languages,
        t.Interested_field,
        t.image,
        COUNT(DISTINCT a.user_id) as patient_count,
        COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.referral_id END) as pending_referrals
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      LEFT JOIN appointments a ON t.therapist_id = a.therapist_id
      LEFT JOIN referrals r ON t.therapist_id = r.referred_to_therapist_id
    `;

    if (!includeAll) {
      // Filter for psychiatrists: specialty_id = 2
      sql += ` WHERE ts.specialty_id = 2`;
    }

    sql += `
      GROUP BY t.therapist_id, t.name, t.email, t.gender, t.license_no, t.years_experience, 
               t.rating, t.bio, t.educational_info, t.fees_min, t.fees_max, t.languages, 
               t.Interested_field, t.image
      ORDER BY t.rating DESC, t.years_experience DESC
    `;

    console.log('Executing psychiatrists query...');
    console.log('SQL:', sql);
    
    const psychiatrists = await query(sql);
    console.log('Found psychiatrists:', psychiatrists.length);
    
    if (psychiatrists.length === 0) {
      console.warn('⚠️ No psychiatrists found! Check if therapist_specialties has specialty_id = 2');
    }

    // Get their specialties
    const psychiatristsWithSpecialties = await Promise.all(
      psychiatrists.map(async (psychiatrist: any) => {
        const specialties: any[] = await query(
          `SELECT s.specialty_id, s.name as specialty_name
           FROM therapist_specialties ts
           JOIN specialties s ON ts.specialty_id = s.specialty_id
           WHERE ts.therapist_id = ?`,
          [psychiatrist.therapist_id]
        );

        return {
          ...psychiatrist,
          specialties: specialties.map(s => s.specialty_name),
          // Add computed fields for compatibility
          specialization: psychiatrist.Interested_field,
          experience_years: psychiatrist.years_experience,
          consultation_fee: psychiatrist.fees_min
        };
      })
    );

    console.log('Returning psychiatrists with specialties:', psychiatristsWithSpecialties.length);

    return NextResponse.json({
      success: true,
      psychiatrists: psychiatristsWithSpecialties,
      count: psychiatristsWithSpecialties.length
    });

  } catch (error: any) {
    console.error('Error fetching psychiatrists:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch psychiatrists',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
