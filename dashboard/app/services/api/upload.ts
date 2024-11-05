// app/api/upload/route.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

// Configura el cliente de S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION ?? '',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  },
});

interface File {
  filepath: string;
  originalFilename: string;
  mimetype: string;
}

interface UploadService {
  uploadS3: (file: File) => Promise<boolean>;
}

export const uploadSvc: UploadService = {
  uploadS3: async (file) => {
    const fileStream = fs.createReadStream(file.filepath);
    const bucketName = process.env.AWS_BUCKET_NAME ?? '';
    const folder = 'imgs';
    const fileName = file.originalFilename;

    const params = {
      Bucket: bucketName,
      Key: `${folder}/${fileName}`,
      Body: fileStream,
      ContentType: file.mimetype,
    };

    try {
      await s3Client.send(new PutObjectCommand(params));
      return true;
    } catch (error) {
      throw new Error('S3 upload error');
    }
  },
};
