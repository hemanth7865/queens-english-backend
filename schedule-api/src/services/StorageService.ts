import { uploadBulkUploadCSVFile } from "../helpers/AzureStorageClient";

export class StorageService {
  async uploadFile(file: any) {
    try {
      if (file) {
        return await uploadBulkUploadCSVFile(file);
      }
    } catch (e) {
      throw new Error(
        e.message || "Something went wrong while uploading file."
      );
    }
  }
}
