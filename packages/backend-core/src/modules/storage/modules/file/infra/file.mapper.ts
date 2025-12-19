import { Injectable } from '@nestjs/common';

import { File, FileAccessType, FileStatus } from '@workspace/database';

import { FileEntity, FileProps } from '../domain/file.entity';

import { BaseMapper } from '@/base/mappers/base.mapper';

@Injectable()
export class FileMapper extends BaseMapper<FileEntity, File> {
  toDomain(record: File): FileEntity {
    const props: FileProps = {
      id: record.id,
      key: record.key,
      bucket: record.bucket || null,
      mimeType: record.mimeType,
      size: record.size,
      status: record.status,
      metadata: record.metadata,
      uploaderId: record.uploaderId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      orphanedAt: record.orphanedAt || null,
      accessType: record.accessType,
      originalName: record.originalName,
    };
    return FileEntity.reconstruct(props);
  }

  toPersistence(entity: FileEntity): File {
    const props = entity.getProps();
    return {
      id: props.id,
      key: props.key,
      bucket: props.bucket || null,
      mimeType: props.mimeType,
      size: props.size,
      status: props.status as FileStatus,
      metadata: props.metadata,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      orphanedAt: props.orphanedAt || null,
      uploaderId: props.uploaderId,
      accessType: props.accessType as FileAccessType,
      originalName: props.originalName,
    };
  }
}
