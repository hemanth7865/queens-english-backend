import { uploadFile } from "../helpers/AWSClient";

export class AWSService {
  async uploadFile(file: any) {
    try {
      if (file) {
        return await uploadFile(file);
      }
    } catch (e) {
      throw new Error(
        e.message || "Something went wrong while uploading file."
      );
    }
  }
}
