import { ok } from 'neverthrow';
import { v7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';
import { UserId } from '@workspace/domain';
import { BoardId, BoardSlug } from '@workspace/domain';

import { BoardCreatedEvent } from './events/board-created.event';
import { BoardDeletedEvent } from './events/board-deleted.event';
import { BoardNameChangedEvent } from './events/board-name-changed.event';

export interface BoardProps extends BaseEntityProps<BoardId> {
  slug: BoardSlug; // 변경 불가
  name: string;
  description: string | null;
  creatorId: UserId;
  createdAt: Date;
}

export interface CreateBoardProps {
  slug: BoardSlug;
  name: string;
  description?: string | null;
  creatorId: UserId;
}

export class BoardEntity extends BaseAggregateRoot<BoardProps, BoardId> {
  private constructor(props: BoardProps) {
    super({
      id: props.id || (v7() as BoardId),
      props,
    });
  }

  get slug(): BoardSlug {
    return this.props.slug;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  public static create(props: CreateBoardProps): BoardEntity {
    const boardProps: BoardProps = {
      id: v7() as BoardId,
      slug: props.slug,
      name: props.name,
      description: props.description || null,
      creatorId: props.creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const entity = new BoardEntity(boardProps);

    entity.addEvent(
      new BoardCreatedEvent({
        boardId: entity.id,
        slug: entity.slug,
        name: entity.name,
        creatorId: props.creatorId,
      }),
    );

    return entity;
  }

  public updateName(newName: string, actorId: UserId): void {
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

  public validate(): void {}

  public delete(actorId: UserId) {
    this.addEvent(
      new BoardDeletedEvent({
        boardId: this.id,
        slug: this.slug,
        name: this.name,
        actorId,
      }),
    );

    return ok(this.toDeleted());
  }
}
