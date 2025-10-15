import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== DEBUG PSYCHIATRISTS API ===');
    
    // Check specialties table
    const specialties = await query('SELECT * FROM specialties');
    console.log('Specialties:', specialties);
    
    // Check therapist_specialties for psychiatrists
    const therapistSpecialtiesCount = await query(
      'SELECT COUNT(*) as count FROM therapist_specialties WHERE specialty_id = 2'
    );
    console.log('Psychiatrists count:', therapistSpecialtiesCount);
    
    // Get sample psychiatrists
    const samplePsychiatrists = await query(`
      SELECT 
        t.therapist_id,
        t.name,
        t.email,
        ts.specialty_id,
        s.name as specialty_name
      FROM therapists t
      INNER JOIN therapist_specialties ts ON t.therapist_id = ts.therapist_id
      INNER JOIN specialties s ON ts.specialty_id = s.specialty_id
      WHERE ts.specialty_id = 2
      LIMIT 10
    `);
    console.log('Sample psychiatrists:', samplePsychiatrists);
    
    // Test the actual API query
    const apiQuery = await query(`
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
      WHERE ts.specialty_id = 2
      GROUP BY t.therapist_id, t.name, t.email, t.gender, t.license_no, t.years_experience, 
               t.rating, t.bio, t.educational_info, t.fees_min, t.fees_max, t.languages, 
               t.Interested_field, t.image
      ORDER BY t.rating DESC, t.years_experience DESC
      LIMIT 5
    `);
    console.log('API query result:', apiQuery);
    
    return NextResponse.json({
      success: true,
      debug: {
        specialties,
        psychiatristsCount: therapistSpecialtiesCount[0]?.count || 0,
        samplePsychiatrists,
        apiQueryResult: apiQuery,
        message: apiQuery.length > 0 
          ? '✅ Query works! Psychiatrists found.' 
          : '❌ No psychiatrists found. Check therapist_specialties table.'
      }
    });
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
