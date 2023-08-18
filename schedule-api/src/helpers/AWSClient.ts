import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const devEnvironment = process.env.NODE_ENV !== "production";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const uploadFile = async (
  file,
  BucketName: string = "eqbulkuploads"
) => {
  const fileName = `${devEnvironment ? "test/" : ""}${uuid()}-${file.name}`;
  const command = new PutObjectCommand({
    Bucket: BucketName,
    Key: fileName,
    Body: file.data,
    ACL: "public-read",
    ContentType: file.mimetype,
  });

  await s3Client.send(command);
  return fileName;
};

export default s3Client;
