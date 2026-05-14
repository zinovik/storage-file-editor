import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getFile, getFileNames, saveFile } from '@/lib/services/storage';
import { users } from '@/lib/users';
import { authOptions } from '@/lib/auth';

export const GET = async (request: Request) => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    }

    const user = users.find((u) => u.email === email);

    if (!user)
        return NextResponse.json({ error: 'User not found' }, { status: 403 });

    const selectedBucket = new URL(request.url).searchParams.get('bucket');
    const selectedFilename = new URL(request.url).searchParams.get('filename');

    if (!selectedBucket && user.allowedBuckets.length === 0)
        return NextResponse.json({ buckets: [], filenames: [], file: '' });

    if (selectedBucket && !user.allowedBuckets.includes(selectedBucket)) {
        return NextResponse.json(
            { error: 'Bucket not allowed' },
            { status: 403 }
        );
    }

    const currentBucket = selectedBucket || user.allowedBuckets[0];

    let filenames;

    if (!selectedFilename) {
        filenames = (await getFileNames(currentBucket)).filter(
            (f) => f.endsWith('.json') || f.endsWith('.csv')
        );

        if (filenames.length === 0)
            return NextResponse.json({
                buckets: user.allowedBuckets,
                filenames: [],
                file: '',
            });
    }

    const currentFilename = selectedFilename || filenames![0];

    const file = await getFile(currentBucket, currentFilename);

    return NextResponse.json({ buckets: user.allowedBuckets, filenames, file });
};

export const POST = async (request: Request) => {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    }

    const user = users.find((u) => u.email === email);

    if (!user)
        return NextResponse.json({ error: 'User not found' }, { status: 403 });

    const selectedBucket = new URL(request.url).searchParams.get('bucket');
    const selectedFilename = new URL(request.url).searchParams.get('filename');

    if (!selectedBucket || !user.allowedBuckets.includes(selectedBucket)) {
        return NextResponse.json(
            { error: 'Bucket not allowed' },
            { status: 403 }
        );
    }

    const json = JSON.parse(await request.text());

    const url = await saveFile(selectedBucket, selectedFilename!, json.file);

    return NextResponse.json({ message: 'File saved successfully', url });
};
