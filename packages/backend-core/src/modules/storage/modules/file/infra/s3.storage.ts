import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import { FileNotFoundError } from '../domain';
import { InvalidS3MetadataException, UnexpectedS3Exception } from '../domain/file.exceptions';
import { FileStoragePort, PresignedUrlOptions } from '../domain/file.storage.port';

import { SsmConfig, ssmConfig } from '@/modules/config';

@Injectable()
export class S3Storage implements FileStoragePort {
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
    });

    try {
      const result = await getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn ?? 3600,
      });

      return ok(result);
    } catch (error) {
      throw new UnexpectedS3Exception(error);
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
        throw new InvalidS3MetadataException();
      }

      return ok({
        size: response.ContentLength,
        mimetype: response.ContentType,
        lastModified: response.LastModified,
      });
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return err(new FileNotFoundError(key));
      }

      throw new UnexpectedS3Exception(error);
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
      throw new UnexpectedS3Exception(error);
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
      throw new UnexpectedS3Exception(error);
    }
  }

  async deleteMany(keys: string[]) {
    if (keys.length === 0) return ok(undefined);

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true, // 에러만 리턴받음
      },
    });

    try {
      await this.client.send(command);
      return ok(undefined);
    } catch (error) {
      throw new UnexpectedS3Exception(error);
    }
  }

  private isNotFoundError(error: unknown): boolean {
    // AWS SDK v3 에러 체크 방식
    return (
      error instanceof S3ServiceException &&
      (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404)
    );
  }
}
