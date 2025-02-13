// app/api/upload/route.js
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

// Configura el cliente de S3
const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION ?? '',
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
  deleteS3: (file: string) => Promise<boolean>;
  uploadS3: (file: any, folder: string) => Promise<boolean>;
}

export const uploadSvc: UploadService = {
  deleteS3: async (file: string) => {
    const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? '';
    const params = {
      Bucket: bucketName,
      Key: file,
    };

    try {
      await s3Client.send(new DeleteObjectCommand(params));
      return true;
    } catch (error) {
      throw new Error('S3 delete error');
    }
  },
  uploadS3: async (file, folder) => {
    if (file instanceof File) {
      const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME ?? '';
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const params = {
        Bucket: bucketName,
        Key: `${folder}/${file.name}`,
        Body: buffer,
        ContentType: file.type,
      };

      try {
        await s3Client.send(new PutObjectCommand(params));
        return true;
      } catch (error) {
        throw new Error('S3 upload error');
      }
    } else {
      return false;
    }
  },
};
