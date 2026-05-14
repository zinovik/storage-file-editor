import { Storage } from '@google-cloud/storage';

const PUBLIC_BUCKETS = ['digital-board-games', 'board-games-list'];
const SORTED_FILES = ['digital-board-games.json'];

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const getFileNames = async (bucketName: string): Promise<string[]> => {
    const [files] = await storage.bucket(bucketName).getFiles();

    return files.map((file) => file.name);
};

export const getFile = async (
    bucketName: string,
    fileName: string
): Promise<string> => {
    const bucket = storage.bucket(bucketName);
    const file = await bucket.file(fileName).download();

    return file.toString();
};

export const saveFile = async (
    bucket: string,
    filename: string,
    file: string
): Promise<string | undefined> => {
    const bucketFile = storage.bucket(bucket).file(filename);

    const processedFile =
        filename.endsWith('.json') && SORTED_FILES.includes(filename)
            ? JSON.stringify(sortKeys(JSON.parse(file)))
            : file;

    const isPublic = PUBLIC_BUCKETS.includes(bucket);

    await bucketFile.save(Buffer.from(processedFile), {
        gzip: true,
        public: isPublic,
        resumable: true,
        contentType: filename.endsWith('.json')
            ? 'application/json'
            : 'text/csv',
        metadata: {
            cacheControl: 'no-cache',
        },
    });

    if (isPublic) return `https://storage.googleapis.com/${bucket}/${filename}`;
};

const sortKeys = (object: Record<string, unknown>) => {
    return (Object.keys(object) as Array<keyof typeof object>)
        .sort((key1, key2) => key1.localeCompare(key2))
        .reduce(
            (acc, key) => ({
                ...acc,
                [key]: object[key],
            }),
            {}
        );
};
