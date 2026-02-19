import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** Normalize DB row to { VcseTypeId, Name } for frontend (handles VcseType, Name, snake_case) */
function normalizeRow(row: Record<string, unknown>): { VcseTypeId: number; Name: string } {
  const id =
    (row.VcseTypeId as number);
  const name = (row.VcseType as string);
  return { VcseTypeId: Number(id), Name: String(name) };
}

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM sponsor_match.vcse_type');
    const rowArray = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];

    const normalized = rowArray.map(normalizeRow);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('OrgTypes API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organisation types' },
      { status: 500 }
    );
  }
}