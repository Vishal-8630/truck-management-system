import multer from "multer";
import path from "path";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// === AWS S3 Setup ===
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// === File Filter ===
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
};

// === Environment Folder ===
// Uploads go into "dev/" or "prod/" folders inside the bucket
const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";

// === Multer-S3 Storage Configuration ===
const storage = multerS3({
  s3,
  bucket: process.env.S3_BUCKET_NAME,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    // Save inside environment folder
    const key = `${envFolder}/${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, key);
  },
});

// === Delete file from S3 if needed ===
export const deleteFromS3 = async (files) => {
  if (!files) return;
  const entries = Object.keys(files);

  for (const field of entries) {
    const key = files[field][0].key;
    try {
      await s3.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
        })
      );
      console.log(`🗑️ Deleted invalid file: ${key}`);
    } catch (err) {
      console.warn(`⚠️ Failed to delete from S3: ${key}`, err.message);
    }
  }
};

// === Multer Instance ===
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export default upload;