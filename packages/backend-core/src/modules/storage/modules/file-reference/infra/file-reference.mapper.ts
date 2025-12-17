import { Injectable } from '@nestjs/common';

import { FileReference } from '@workspace/database';

import { FileReferenceEntity, FileReferenceProps } from '../domain/file-reference.entity';

import { BaseMapper } from '@/base';

@Injectable()
export class FileReferenceMapper extends BaseMapper<FileReferenceEntity, FileReference> {
  toDomain(record: FileReference): FileReferenceEntity {
    const props: FileReferenceProps = {
      id: record.id,
      fileId: record.fileId,
      targetType: record.targetType,
      targetId: record.targetId,
      createdAt: record.createdAt,
      updatedAt: record.createdAt,
    };
    return FileReferenceEntity.reconstruct(props);
  }

  toPersistence(entity: FileReferenceEntity): FileReference {
    const props = entity.getProps();
    return {
      id: props.id,
      fileId: props.fileId,
      targetType: props.targetType,
      targetId: props.targetId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
