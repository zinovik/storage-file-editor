'use client';

import { AuthButton } from './components/auth-button';
import { Editor } from './components/editor';
import { useSession } from 'next-auth/react';

export default function Home() {
    const { data: session } = useSession();

    return (
        <main className="flex min-h-screen w-full flex-col items-center lg:items-start justify-start gap-6 bg-white p-4 overflow-auto lg:overflow-visible">
            <AuthButton />
            {session ? (
                <Editor username={session.user?.name ?? 'unknown'} />
            ) : (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-slate-700">
                    Please sign in to view and edit files
                </div>
            )}
        </main>
    );
}
