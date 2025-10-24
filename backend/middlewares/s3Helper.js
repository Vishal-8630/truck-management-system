import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const getSignedS3Url = async (key) => {
  if (!key) return null;

  let cleanKey = key.trim();

  // 🧹 If key is a full S3 URL, extract only the object name part
  if (cleanKey.startsWith("http")) {
    try {
      const url = new URL(cleanKey);
      cleanKey = decodeURIComponent(url.pathname.replace(/^\/+/, "")); // remove leading '/'
    } catch (err) {
      console.warn("Invalid S3 URL format:", cleanKey);
      return null;
    }
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: cleanKey,
  });

  try {
    return await getSignedUrl(s3, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("Error generating signed URL:", err.message);
    return null;
  }
};
