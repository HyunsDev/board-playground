import path from 'path';

import { err, ok } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

import { FileId } from '@workspace/domain';

import { FILE_ACCESS_TYPE, FILE_STATUS, FileAccessType, FileStatus } from './file.enums';
import { InvalidFileError } from './file.errors';
import { FileMetadataResult } from './file.storage.port';

import { BaseAggregateRoot } from '@/base/blocks/base.aggregate-root';
import { BaseEntityProps } from '@/base/blocks/base.entity';

export interface FileProps extends BaseEntityProps<FileId> {
  key: string;
  bucket: string | null;
  mimeType: string;
  size: number;
  status: FileStatus;
  uploaderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  orphanedAt: Date | null;
  accessType: FileAccessType;
  originalName: string;
}

export interface CreateFileProps {
  originalName: string;
  accessType: FileAccessType;
  mimeType: string;
  uploaderId: string;
  size: number;
}

const AccessTypeKeyMap = {
  [FILE_ACCESS_TYPE.PRIVATE]: 'private',
  [FILE_ACCESS_TYPE.PUBLIC]: 'public',
};

export class FileEntity extends BaseAggregateRoot<FileProps, FileId> {
  protected constructor(props: FileProps) {
    super({
      id: props.id,
      props,
    });
    return this;
  }

  get id() {
    return this.props.id;
  }
  get key() {
    return this.props.key;
  }
  get mimeType() {
    return this.props.mimeType;
  }
  get status() {
    return this.props.status;
  }
  get size() {
    return this.props.size;
  }

  static create({ originalName, accessType, mimeType, uploaderId, size }: CreateFileProps) {
    const id = uuidv7() as FileId;

    // 유효성 검사 예시
    if (!mimeType || !mimeType.includes('/')) {
      return err(new InvalidFileError('Invalid mimeType provided.'));
    }

    if (!size || size < 0) {
      return err(new InvalidFileError('File size must be a non-negative number.'));
    }

    const ext = path.extname(originalName);
    const fileName = ext ? `${id}${ext}` : id;

    // S3 Key 생성 전략
    const key = `uploads/${AccessTypeKeyMap[accessType]}/${id}/${fileName}`;

    return ok(
      new FileEntity({
        id,
        key,
        bucket: null,
        mimeType,
        size: size || 0,
        status: FILE_STATUS.PENDING,
        originalName,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
        accessType,
        uploaderId,
        orphanedAt: null,
      }),
    );
  }

  confirmUpload(metadata: FileMetadataResult) {
    if (this.props.status === FILE_STATUS.ACTIVE) {
      return ok(undefined);
    }

    if (this.props.status === FILE_STATUS.FAILED) {
      return err(new InvalidFileError('Cannot confirm upload for a failed file.'));
    }

    if (this.props.size !== metadata.size) {
      return err(new InvalidFileError('File size does not match the uploaded file size.'));
    }

    if (this.props.mimeType !== metadata.mimetype) {
      return err(new InvalidFileError('File mimeType does not match the uploaded file mimeType.'));
    }

    this.props.metadata = {
      ...this.props.metadata,
      ...metadata,
    };

    this.props.status = FILE_STATUS.ACTIVE;
    this.props.updatedAt = new Date();

    return ok(undefined);
  }

  /**
   * [Behavior] 업로드 실패 처리
   */
  markAsFailed(): void {
    if (this.props.status !== FILE_STATUS.ACTIVE) {
      this.props.status = FILE_STATUS.FAILED;
      this.props.updatedAt = new Date();
    }
  }

  validate() {}

  delete() {
    return ok(this.toDeleted());
  }
}
