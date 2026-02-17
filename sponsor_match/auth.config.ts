import type {NextAuthOptions, Session} from 'next-auth';
/**
 * This file configures NextAuth for the app, for use in src/auth.ts and with next-auth, for username/password (credentials) login.
 * 
 * Cleanups/fixes:
 *  - Removed unused import of NextAuthConfig (no such named export, typing config inline suffices)
 *  - Use correct satisfying type at export.
 * 
 * The providers array is set in src/auth.ts when used with Credentials.
 */


export const authConfig: NextAuthOptions = {
    pages: {
        signIn: '/login',
    },
    // The "authorized" callback is not a valid NextAuth callback.
    // For NextAuth route protection, use middleware (see /middleware.ts) or built-in auth logic.
    callbacks: {
        // Place any other valid NextAuth callback overrides here if needed
        jwt({token, user}: {token: any; user: any}) {
            if (user){
                token.id = user.id;
                token.accountType = (user as{
                    accountType?:number}).accountType;
            }
            return token;
        },
        session({session, token}: {session: Session; token: any}) {
            if (session.user) {
                (session.user as {id?: string}).id = token.id;
                (session.user as {accountType?:number}).accountType = token.accountType;
            }
            return session;
        },
    },
    providers: [],
} satisfies NextAuthOptions;