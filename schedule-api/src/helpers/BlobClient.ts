import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';

const account = process.env.STORAGE_ACCOUNT_NAME || '';
const accountKey = process.env.STORAGE_ACCOUNT_KEY || '';

export const getBlobClient = (path:string) => {
    const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

    const blobServiceClient = new BlobServiceClient(
        // When using AnonymousCredential, following url should include a valid SAS or support public access
        `https://${account}.blob.core.windows.net`,
        sharedKeyCredential
    );
    return blobServiceClient.getContainerClient(path);
};
