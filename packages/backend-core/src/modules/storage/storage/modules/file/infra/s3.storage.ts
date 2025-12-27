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
import { ok, ResultAsync } from 'neverthrow';

import { FileNotFoundError } from '../domain';
import { InvalidS3MetadataException, UnexpectedS3Exception } from '../domain/file.exceptions';
import { FileStoragePort, PresignedUrlOptions } from '../domain/file.storage.port';

import { SsmConfig, ssmConfig } from '@/modules/foundation/config';

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

  generatePresignedPutUrl(options: PresignedUrlOptions) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: options.key,
      ContentType: options.mimetype,
    });

    return ResultAsync.fromPromise(
      getSignedUrl(this.client, command, {
        expiresIn: options.expiresIn ?? 3600,
      }),
      (error) => {
        throw new UnexpectedS3Exception(error);
      },
    );
  }

  getFileMetadata(key: string) {
    const command = new HeadObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return ResultAsync.fromPromise(this.client.send(command), (error) => {
      if (this.isNotFoundError(error)) {
        return new FileNotFoundError(key);
      }
      throw new UnexpectedS3Exception(error);
    }).andThen((response) => {
      if (!response.ContentLength || !response.ContentType || !response.LastModified) {
        throw new InvalidS3MetadataException();
      }

      return ok({
        size: response.ContentLength,
        mimetype: response.ContentType,
        lastModified: response.LastModified,
      });
    });
  }

  generatePresignedGetUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return ResultAsync.fromPromise(
      getSignedUrl(this.client, command, {
        expiresIn: 3600, // 1 hour
      }),
      (error) => {
        throw new UnexpectedS3Exception(error);
      },
    );
  }

  delete(key: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return ResultAsync.fromPromise(this.client.send(command), (error) => {
      throw new UnexpectedS3Exception(error);
    }).map(() => undefined);
  }

  deleteMany(keys: string[]) {
    if (keys.length === 0) return new ResultAsync(Promise.resolve(ok(undefined)));

    const command = new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
        Quiet: true, // 에러만 리턴받음
      },
    });

    return ResultAsync.fromPromise(this.client.send(command), (error) => {
      throw new UnexpectedS3Exception(error);
    }).map(() => undefined);
  }

  private isNotFoundError(error: unknown): boolean {
    // AWS SDK v3 에러 체크 방식
    return (
      error instanceof S3ServiceException &&
      (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404)
    );
  }
}
