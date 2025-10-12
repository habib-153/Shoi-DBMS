import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'shoi',
  connectionLimit: 10,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const therapist_id = searchParams.get('therapist_id');
    const date = searchParams.get('date');

    if (!therapist_id || !date) {
      return NextResponse.json({ error: 'therapist_id and date are required' }, { status: 400 });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Get existing appointments for the therapist on the selected date
    const [existingAppointments] = await connection.execute(
      `SELECT start_time, end_time 
       FROM appointments 
       WHERE therapist_id = ? 
       AND DATE(start_time) = ? 
       AND status IN ('pending', 'confirmed', 'paid')`,
      [therapist_id, date]
    ) as any;

    await connection.end();

    // Generate available time slots (9 AM to 6 PM, 1-hour slots)
    const slots: Array<{ start: string; end: string }> = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      const startTime = `${date} ${hour.toString().padStart(2, '0')}:00:00`;
      const endTime = `${date} ${(hour + 1).toString().padStart(2, '0')}:00:00`;

      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some((apt: any) => {
        const aptStart = new Date(apt.start_time).getTime();
        const aptEnd = new Date(apt.end_time).getTime();
        const slotStart = new Date(startTime).getTime();
        const slotEnd = new Date(endTime).getTime();

        return (slotStart < aptEnd && slotEnd > aptStart);
      });

      if (!hasConflict) {
        slots.push({
          start: startTime,
          end: endTime
        });
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Slots API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
