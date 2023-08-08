import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

export class AWSService {
  async uploadFile(file: any) {
    try {
      if (file) {
        const fileName = `${uuid()}-${file.name}`;
        const s3 = new S3Client({
          region: "ap-south-1",
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        const command = new PutObjectCommand({
          Bucket: "eqbulkuploads",
          Key: fileName,
          Body: file.data,
        });
        await s3.send(command);
        return fileName;
      }
    } catch (e) {
      throw new Error(
        e.message || "Something went wrong while uploading file."
      );
    }
  }
}
