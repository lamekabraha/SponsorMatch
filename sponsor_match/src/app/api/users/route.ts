import pool from '@/../lib/db';
import { NextResponse } from 'next/server';

function mapRow(row: Record<string, unknown>): { id: number; name: string; email: string } {
  const id = (row.id ?? row.user_id ?? row.UserID ?? 0) as number;
  const name = (row.name ?? row.user_name ?? '') as string;
  const email = (row.email ?? row.user_email ?? '') as string;
  return { id, name, email };
}

export async function GET() {
  try {
    const [rows] = await (pool as { query: (sql: string) => Promise<[unknown[], unknown]> }).query(
      'SELECT * FROM sponsor_match.account;'
    );
    const data = (rows as Record<string, unknown>[]).map(mapRow);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Database query error: ', error);
    return NextResponse.json(
      { success: false, error: 'Database query failed' },
      { status: 500 }
    );
  }
}
