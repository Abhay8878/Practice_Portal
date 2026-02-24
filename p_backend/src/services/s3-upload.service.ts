import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import 'multer'; // Required for Express.Multer.File type

/**
 * Metadata stored in the database for 3D images
 */
export interface Image3DMetadata {
  s3_key: string;
  s3_bucket: string;
  file_name: string;
  file_size: number;
  content_type: string;
  order_id: string;
  patient_id: string;
  uploaded_at: string;
}

/**
 * Service for handling S3 uploads with multipart support for large files
 */
@Injectable()
export class S3UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(S3UploadService.name);

  // 10MB chunk size for multipart uploads
  private readonly CHUNK_SIZE = 10 * 1024 * 1024;

  constructor(private readonly configService: ConfigService) {
    this.bucketName =
      this.configService.get<string>('S3_BUCKET_NAME') || 'aoa-3d-image-bucket';

    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey:
          this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  /**
   * Upload a file to S3 using multipart upload for large files
   * Files are automatically chunked into 10MB parts
   */
  async uploadFile(
    file: Express.Multer.File,
    orderId: string,
    patientId: string,
  ): Promise<Image3DMetadata> {
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(
      /[^a-zA-Z0-9._-]/g,
      '_',
    );
    const s3Key = `3d-images/${patientId}/${orderId}/${timestamp}_${sanitizedFileName}`;

    this.logger.log(
      `Starting multipart upload for ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
    );

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            'original-filename': file.originalname,
            'order-id': orderId,
            'patient-id': patientId,
            'upload-timestamp': timestamp.toString(),
          },
        },
        // 10MB part size for multipart upload
        partSize: this.CHUNK_SIZE,
        // Upload up to 4 parts concurrently
        queueSize: 4,
        // Leave parts on error for debugging (auto-cleaned by S3 lifecycle)
        leavePartsOnError: false,
      });

      // Track upload progress
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = ((progress.loaded / progress.total) * 100).toFixed(
            1,
          );
          this.logger.log(
            `Upload progress: ${percentage}% (${progress.loaded}/${progress.total} bytes)`,
          );
        }
      });

      await upload.done();

      this.logger.log(`Successfully uploaded ${file.originalname} to S3`);

      return {
        s3_key: s3Key,
        s3_bucket: this.bucketName,
        file_name: file.originalname,
        file_size: file.size,
        content_type: file.mimetype,
        order_id: orderId,
        patient_id: patientId,
        uploaded_at: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to upload ${file.originalname} to S3:`, error);
      throw error;
    }
  }

  /**
   * Generate a presigned URL for downloading the file
   * URL is valid for 1 hour by default
   */
  async getPresignedUrl(
    s3Key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(s3Key: string): Promise<void> {
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
        }),
      );
      this.logger.log(`Deleted file from S3: ${s3Key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${s3Key}`, error);
      throw error;
    }
  }
}
