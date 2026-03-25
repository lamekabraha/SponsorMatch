import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';

async function GetAccountId(): Promise<number | null> {
    const session = await getServerSession(authConfig);
    return (session?.user as {accountId?: number})?.accountId || null;
};


export async function GET() {
    const accountId = await GetAccountId();

    if (!accountId) {
        return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });
    }

    try {
        const [rows] = await pool.execute(
            `select a.Name, a.AccountTypeId, a.CompanyLogo as logo, l.Address, a.Website, a.Instagram, a.Twitter, a.Facebook, a.LinkedIn
            from account a
            inner join location l on a.AccountId = l.AccountId
            where a.AccountId = ?`, [accountId]
        );
        const accountData = rows as any[];
        return NextResponse.json({ success: true, data: accountData });
    } catch (error) {
        console.error('Database query error: ', error);
        return NextResponse.json({ success: false, error: 'Database query failed' }, { status: 500 });
    }
}