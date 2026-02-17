import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import {pool} from '@/lib/db';
import {authConfig} from '../auth.config';

interface userRow{
    UserId: number;
    AccountId:number;
    FirstName: string;
    LastName: string;
    Email: string;
    HashedPassword: string;
    AccountType?:number;
}

const handler = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const email = credentials?.email as string;
                const password = credentials?.password as string;

                if (!email || !password) {
                    return null;
                };

                const [rows] = await pool.execute(
                    `SELECT u.UserId, u.AccountId, u.FirstName, u.LastName, u.Email, u.HashedPassword, a.AccountType
                     FROM sponsor_match.user u
                     JOIN sponsor_match.account a ON u.AccountId = a.AccountId
                     WHERE u.Email = ?`,
                    [email.toLowerCase()]
                  ) as [userRow[], any];
                
                const user = rows[0];
                if (!user || !user.HashedPassword) {
                    return null;
                }

                const isValid = await bcrypt.compare(password, user.HashedPassword);
                if (!isValid) return null;

                return {
                    id: String(user.UserId),
                    email: user.Email,
                    name: `${user.FirstName} ${user.LastName}`,
                    accountType: user.AccountType,
                };
            },
        }),
    ],
});

export const handlers = { GET: handler, POST: handler };