import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth-config';
import { pool } from '@/lib/db';

export async function PUT(request: Request) {
    const session = await getServerSession(authConfig);
    const accountId = session?.user?.accountId; // Use accountId to find the business

    if (!accountId) {
        return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });
    }

    const { preferredCategories, preferredBenefits } = await request.json();

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Get the BusinessId for this account
        const [bus]: any = await connection.execute(
            'SELECT BusinessId FROM business WHERE AccountId = ?', 
            [accountId]
        );
        const businessId = bus[0]?.BusinessId;

        if (!businessId) throw new Error("Business profile not found");

        // 2. Update Categories (Delete then Bulk Insert)
        await connection.execute('DELETE FROM business_category_pref WHERE BusinessId = ?', [businessId]);
        if (preferredCategories.length > 0) {
            const catValues = preferredCategories.map((id: number) => [businessId, id]);
            await connection.query(
                'INSERT INTO business_category_pref (BusinessId, VcseTypeId) VALUES ?', 
                [catValues]
            );
        }

        // 3. Update Benefits (Delete then Bulk Insert)
        await connection.execute('DELETE FROM business_benefit_pref WHERE BusinessId = ?', [businessId]);
        if (preferredBenefits.length > 0) {
            const benValues = preferredBenefits.map((id: number) => [businessId, id]);
            await connection.query(
                'INSERT INTO business_benefit_pref (BusinessId, BenefitTypeId) VALUES ?', 
                [benValues]
            );
        }

        await connection.commit();
        return NextResponse.json({ success: true, message: 'Preferences updated' });
    } catch (error: any) {
        await connection.rollback();
        console.error('Database Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}