import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import moment = require("moment");

const account = process.env.STORAGE_ACCOUNT_NAME || "";
const accountKey = process.env.STORAGE_ACCOUNT_KEY || "";

export const getBlobClient = async (path: string) => {
  const sharedKeyCredential = new StorageSharedKeyCredential(
    account,
    accountKey
  );
  const blobServiceClient = new BlobServiceClient(
    `https://${account}.blob.core.windows.net`,
    sharedKeyCredential
  );
  return blobServiceClient.getContainerClient(path);
};

/**
 * Uploads a file to Azure Blob Storage.
 * @param fileName - The name of the file to be uploaded.
 * @param buffer - The buffer containing the file data.
 * @param type - The MIME type of the file.
 * @returns The URL of the uploaded file.
 * @throws An error if the upload fails.
 */
export const uploadFile = async (
  containerPath: string,
  fileName: string,
  buffer: Buffer,
  type: string
) => {
  try {
    const containerClient = await getBlobClient(containerPath);
    const blobClient = containerClient.getBlockBlobClient(fileName);
    await blobClient.uploadData(buffer, {
      blobHTTPHeaders: {
        blobContentType: type,
      },
    });
    return blobClient.url;
  } catch (error) {
    throw error;
  }
};

export const uploadBulkUploadCSVFile = async (file) => {
  const fileName = `${moment().valueOf()}-${file.name}`;
  const containerPath = `assets/AP-bulk-upload`;
  const url = await uploadFile(
    containerPath,
    fileName,
    file.data,
    file.mimetype
  );

  return decodeURIComponent(url).replace(
    `https://${account}.blob.core.windows.net/`,
    ""
  );
};
