import NextAuth from "next-auth";
import {JWT} from next-auth/jwt;


declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            userId: number;
            accountTypeId: number;
            accountId: number;
        }& DefaultSession['user'];
    }

    interface User {
        id: string;
        userId: number;
        accountTypeId: number;
        accountId: number;
    }
};

declare module 'next-auth/jwt'{
    interface JWT {
        id: string;
        userId: number;
        accountTypeId: number;
        accountId: number;
    }
}