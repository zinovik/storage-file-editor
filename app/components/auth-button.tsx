'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export function AuthButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="text-gray-500">Loading...</div>;
    }

    if (session) {
        return (
            <div className="flex items-center gap-4">
                <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Sign out
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn('google')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
            Sign in with Google
        </button>
    );
}
