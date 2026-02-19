import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/** Normalize DB row to { VcseTypeId, Name } for frontend (handles VcseType, Name, snake_case) */
function normalizeRow(row: Record<string, unknown>): { VcseTypeId: number; Name: string } {
  const benefitId = (row.BenefitId as number);
  const benefitName = (row.Benefit as string);
  return { benefitId: Number(benefitId), benefitName: String(benefitName) };
}

export async function GET() {
  try {
    const [rows] = await pool.execute('SELECT * FROM sponsor_match.campaign_benefit');
    const rowArray = Array.isArray(rows) ? (rows as Record<string, unknown>[]) : [];

    const normalized = rowArray.map(normalizeRow);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Campaign Benefit Type API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign benefit types' },
      { status: 500 }
    );
  }
}