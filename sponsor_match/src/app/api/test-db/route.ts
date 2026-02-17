import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [rows] = await (pool as { query: (sql: string) => Promise<[unknown[], unknown]> }).query(
      'SELECT * FROM sponsor_match.account;'
    );
    const data = rows;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Database query error: ', error);
    return NextResponse.json(
      { success: false, error: 'Database query failed' },
      { status: 500 }
    );
  }
}
