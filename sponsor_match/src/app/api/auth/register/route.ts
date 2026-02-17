import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { pool } from '@/lib/db';

export async function POST(request: Request) {
    // Obtain a dedicated connection from the pool to manage the transaction
    const connection = await pool.getConnection();

    try {
        const body = await request.json();
        const { email, password, firstName, lastName, accountName, role } = body;

        if (!email || !password || !firstName || !lastName || !accountName || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Logic based on provided organization types: 2 for VCSE, 1 for SME [cite: 1, 2, 5]
        const accountTypeId = role.toLowerCase() === 'vcse' ? 2 : 1;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Start Transaction
        await connection.beginTransaction();

        // 1. Insert into Accounts table
        const [accountRows] = await connection.execute(
            `INSERT INTO sponsor_match.account (Name, AccountType) VALUES (?, ?)`,
            [accountName, accountTypeId]
        );

        const accountId = (accountRows as any).insertId;

        if (!accountId) {
            throw new Error('Failed to retrieve accountId');
        }

        // 2. Insert into User table using the new accountId
        await connection.execute(
            `INSERT INTO sponsor_match.user (AccountId, FirstName, LastName, Email, HashedPassword, Verified)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [accountId, firstName, lastName, email.toLowerCase(), hashedPassword]
        );

        // Commit both queries at once
        await connection.commit();

        return NextResponse.json({ success: true });

    } catch (error) {
        // If the user query or any step fails, undo the account creation
        await connection.rollback();
        
        console.error('Registration Error: ', error);
        return NextResponse.json(
            { error: 'Registration Failed. Database rolled back.' },
            { status: 500 }
        );
    } finally {
        // Release connection back to the pool
        connection.release();
    }
}