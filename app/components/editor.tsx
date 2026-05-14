'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function Editor() {
    const { data: session } = useSession();

    const [isLoading, setIsLoading] = useState(true);
    const [buckets, setBuckets] = useState<string[]>([]);
    const [filenames, setFilenames] = useState<string[]>([]);
    const [file, setFile] = useState('');
    const [selectedBucket, setSelectedBucket] = useState('');
    const [selectedFilename, setSelectedFilename] = useState('');
    const [isDefaultFileFetched, setAlreadyFetchedDefaultFile] =
        useState(false);

    useEffect(() => {
        const updateState = async () => {
            if (!session) return;

            if (isDefaultFileFetched) {
                // we get here because we change selectedFilename after fetching the default file
                setAlreadyFetchedDefaultFile(false);
                return;
            }

            if (selectedFilename === '') setAlreadyFetchedDefaultFile(true);

            setIsLoading(true);

            const response = await fetch(
                `/api/file?bucket=${selectedBucket}&filename=${selectedFilename}`
            );

            if (!response.ok) return;

            const data = (await response.json()) as {
                buckets: string[];
                filenames?: string[];
                file: string;
            };

            setBuckets(data.buckets);
            if (data.filenames) setFilenames(data.filenames);

            if (!selectedBucket && data.buckets[0])
                setSelectedBucket(data.buckets[0]);
            if (!selectedFilename && data.filenames?.[0])
                setSelectedFilename(data.filenames[0]);

            let parsedFile;
            try {
                parsedFile = JSON.stringify(JSON.parse(data.file), null, 2);
            } catch (_error) {
                //
            }
            setFile(parsedFile || data.file);

            setIsLoading(false);
        };

        updateState();
    }, [session, selectedBucket, selectedFilename]);

    const handleSaveFileClick = async (body: string) => {
        const response = await fetch(
            `/api/file?bucket=${selectedBucket}&filename=${selectedFilename}`,
            {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json',
                // },
                body: JSON.stringify({ file: body }),
            }
        );

        console.log(await response.json());
    };

    return (
        <>
            <div id="current-user">
                Current user: {session?.user?.name || 'not logged in'}
            </div>
            <div id="status">
                Status: {isLoading ? '⏳ Loading...' : '🟢 Ready'}
            </div>

            <div>
                <label htmlFor="buckets">Buckets:</label>
            </div>
            <div>
                <select
                    id="buckets"
                    size={4}
                    value={selectedBucket}
                    onChange={(event) => {
                        setSelectedBucket(event.target.value);
                        setFilenames([]);
                        setSelectedFilename('');
                        setFile('');
                    }}
                    style={{ width: '350px' }}
                    disabled={isLoading}
                >
                    {buckets.map((bucket) => (
                        <option key={bucket} value={bucket}>
                            {bucket}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="filenames">Filenames:</label>
            </div>
            <div>
                <select
                    id="filenames"
                    size={4}
                    value={selectedFilename}
                    onChange={(event) => {
                        setSelectedFilename(event.target.value);
                        setFile('');
                    }}
                    style={{ width: '350px' }}
                    disabled={isLoading}
                >
                    {filenames.map((filename) => (
                        <option key={filename} value={filename}>
                            {filename}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="file">File:</label>
            </div>
            <div>
                <textarea
                    id="file"
                    onChange={(event) => setFile(event.target.value)}
                    value={file}
                    disabled={isLoading}
                />
            </div>

            <div>
                <button
                    onClick={() => handleSaveFileClick(file)}
                    disabled={isLoading}
                >
                    Save
                </button>
            </div>
        </>
    );
}
