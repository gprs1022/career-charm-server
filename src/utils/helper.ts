import AWS from "aws-sdk";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadThumbnailToS3 = async (thumbnail: String) => {
  const key = `thumbnails/${Date.now()}_${thumbnail}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: "image/*",
  };
  const command = new PutObjectCommand(params);
  const url = await getSignedUrl(s3Client, command);
  return { url, key };
};

export const getObjectUrl = async (key: any) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  };
  const command = new GetObjectCommand(params);
  const url = await getSignedUrl(s3Client, command);
  console.log("this is url", url);
  return url;
};

export const getCorsOptions = () => {
  return {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  };
};
