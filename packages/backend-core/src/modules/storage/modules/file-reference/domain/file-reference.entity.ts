import { v7 as uuidv7 } from 'uuid';

import { BaseEntityProps, BaseAggregateRoot } from '@/base';

export interface FileReferenceProps extends BaseEntityProps {
  fileId: string;
  targetType: string;
  targetId: string;
}

export interface CreateFileReferenceProps {
  fileId: string;
  targetType: string;
  targetId: string;
}

export class FileReferenceEntity extends BaseAggregateRoot<FileReferenceProps> {
  private constructor(props: FileReferenceProps) {
    super({
      id: props.id,
      props,
    });
  }

  get id() {
    return this.props.id;
  }
  get fileId() {
    return this.props.fileId;
  }
  get targetType() {
    return this.props.targetType;
  }
  get targetId() {
    return this.props.targetId;
  }

  static create(props: CreateFileReferenceProps) {
    const id = uuidv7();
    const now = new Date();
    return new FileReferenceEntity({
      id,
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstruct(props: FileReferenceProps) {
    return new FileReferenceEntity(props);
  }

  validate(): void {}
}
