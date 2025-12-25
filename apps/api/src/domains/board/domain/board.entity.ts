import { v7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';

import { BoardCreatedEvent } from './events/board-created.event';
import { BoardDeletedEvent } from './events/board-deleted.event';
import { BoardNameChangedEvent } from './events/board-name-changed.event';

export interface BoardProps extends BaseEntityProps {
  slug: string; // 변경 불가
  name: string;
  description: string | null;
  managerId: string;
  createdAt: Date;
}

export interface CreateBoardProps {
  slug: string;
  name: string;
  description?: string | null;
  managerId: string;
}

export class BoardEntity extends BaseAggregateRoot<BoardProps> {
  private constructor(props: BoardProps) {
    super({
      id: props.id || v7(),
      props,
    });
  }

  get slug(): string {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  public static create(props: CreateBoardProps): BoardEntity {
    const id = v7();
    const boardProps: BoardProps = {
      id,
      slug: props.slug,
      name: props.name,
      description: props.description || null,
      managerId: props.managerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const entity = new BoardEntity(boardProps);

    entity.addEvent(
      new BoardCreatedEvent({
        boardId: entity.id,
        slug: entity.slug,
        name: entity.name,
        actorId: props.managerId,
      }),
    );

    return entity;
  }

  public updateName(newName: string, actorId: string): void {
    const oldName = this.props.name;
    this.props.name = newName;
    this.props.updatedAt = new Date();

    this.addEvent(
      new BoardNameChangedEvent({
        boardId: this.id,
        actorId,
        oldName,
        newName,
      }),
    );
  }

  public updateDescription(newDescription: string | null): void {
    this.props.description = newDescription;
    this.props.updatedAt = new Date();
  }

  public beforeDelete(actorId: string): void {
    this.addEvent(
      new BoardDeletedEvent({
        boardId: this.id,
        slug: this.slug,
        name: this.name,
        actorId,
      }),
    );
  }

  static reconstruct(props: BoardProps): BoardEntity {
    return new BoardEntity(props);
  }

  public validate(): void {}
}
