'use client';

import { useEffect, useState } from 'react';

type FileResponse = {
    buckets: string[];
    filenames?: string[];
    file: string;
};

const formatFile = (raw: string) => {
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
};

export function Editor({ username }: { username: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [buckets, setBuckets] = useState<string[]>([]);
    const [filenames, setFilenames] = useState<string[]>([]);
    const [file, setFile] = useState('');
    const [selectedBucket, setSelectedBucket] = useState('');
    const [selectedFilename, setSelectedFilename] = useState('');
    const [needUpdate, setNeedUpdate] = useState(true);

    useEffect(() => {
        const updateState = async () => {
            setNeedUpdate(false);

            setIsLoading(true);

            const response = await fetch(
                `/api/file?bucket=${selectedBucket}&filename=${selectedFilename}`
            );

            if (!response.ok) {
                setIsLoading(false);
                return;
            }

            const data = (await response.json()) as FileResponse;

            setBuckets(data.buckets);
            if (data.filenames) setFilenames(data.filenames);

            if (!selectedBucket && data.buckets[0])
                setSelectedBucket(data.buckets[0]);
            if (!selectedFilename && data.filenames?.[0]) {
                setSelectedFilename(data.filenames[0]);
            }
            setFile(formatFile(data.file));

            setIsLoading(false);
        };

        updateState();
    }, [needUpdate]);

    const saveFile = async () => {
        setIsLoading(true);

        const response = await fetch(
            `/api/file?bucket=${selectedBucket}&filename=${selectedFilename}`,
            {
                method: 'POST',
                body: JSON.stringify({ file }),
            }
        );

        const data = await response.json();

        setIsLoading(false);

        alert(data.message);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 flex-1 w-full min-h-0">
            <aside className="flex-shrink-0 flex flex-col gap-4 w-full lg:w-[320px]">
                <div className="text-sm text-slate-600">
                    Current user: {username} {isLoading ? '⏳' : '🟢'}
                </div>

                <div>
                    <div className="mb-1 text-sm font-semibold text-slate-700">
                        Bucket
                    </div>
                    <fieldset disabled={isLoading} className="space-y-2">
                        {buckets.map((bucket) => (
                            <label
                                key={bucket}
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition cursor-pointer ${
                                    selectedBucket === bucket
                                        ? 'border-blue-600 bg-sky-50'
                                        : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="buckets"
                                    value={bucket}
                                    checked={selectedBucket === bucket}
                                    onChange={() => {
                                        setSelectedBucket(bucket);
                                        setFilenames([]);
                                        setSelectedFilename('');
                                        setFile('');
                                        setNeedUpdate(true);
                                    }}
                                />
                                <span>{bucket}</span>
                            </label>
                        ))}
                    </fieldset>
                </div>

                <div>
                    <div className="mb-1 text-sm font-semibold text-slate-700">
                        File
                    </div>
                    <fieldset disabled={isLoading} className="space-y-2">
                        {filenames.map((filename) => (
                            <label
                                key={filename}
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition cursor-pointer ${
                                    selectedFilename === filename
                                        ? 'border-blue-600 bg-sky-50'
                                        : 'border-slate-300 bg-white hover:border-slate-400'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="filenames"
                                    value={filename}
                                    checked={selectedFilename === filename}
                                    onChange={() => {
                                        setSelectedFilename(filename);
                                        setFile('');
                                        setNeedUpdate(true);
                                    }}
                                />
                                <span>{filename}</span>
                            </label>
                        ))}
                    </fieldset>
                </div>

                <button
                    type="button"
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    onClick={saveFile}
                    disabled={isLoading}
                >
                    Save
                </button>
            </aside>

            <div className="flex-1 min-h-0">
                <textarea
                    id="file"
                    value={file}
                    onChange={(event) => setFile(event.target.value)}
                    disabled={isLoading}
                    className="w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-300 h-auto min-h-[calc(100vh-6rem)] lg:min-h-[320px] lg:h-full"
                />
            </div>
        </div>
    );
}
