import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { SsmConfig, ssmConfig } from '../../../config';
import { StorageError } from '../file/domain/file.errors';
import { FileStoragePort, PresignedUrlOptions } from '../file/domain/file.storage.port';

@Injectable()
export class S3Service implements FileStoragePort {
  private client: S3Client;
  private bucket: string;

  constructor(
    @Inject(ssmConfig.KEY)
    private readonly config: SsmConfig,
  ) {
    this.client = new S3Client({ region: this.config.region });
    this.bucket = this.config.aws.s3.bucketName;
  }

  async generatePresignedPutUrl(options: PresignedUrlOptions) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.mimetype,
      // ACL: 'public-read' // 필요시 설정, 보통은 버킷 정책 따름
    });

    try {
      const result = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn ?? 3600,
      });

      return ok(result);
    } catch (error) {
      return err(new StorageError('Failed to generate presigned PUT URL', error));
    }
  }

  async getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const response = await this.client.send(command);

      if (!response.ContentLength || !response.ContentType || !response.LastModified) {
        return err(new StorageError('Incomplete metadata received from S3'));
      }

      return ok({
        size: response.ContentLength,
        mimetype: response.ContentType,
        lastModified: response.LastModified,
      });
    } catch (error) {
      return err(new StorageError('Failed to get file metadata', error));
    }
  }

  async generatePresignedGetUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    try {
      const result = await getSignedUrl(this.client, command, {
        expiresIn: 3600, // 1 hour
      });

      return ok(result);
    } catch (error) {
      return err(new StorageError('Failed to generate presigned GET URL', error));
    }
  }

  async delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    try {
      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      return err(new StorageError('Failed to delete object from S3', error));
    }
  }
}
