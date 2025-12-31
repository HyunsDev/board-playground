import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';
import { MANAGER_ROLE, ManagerRole } from '@workspace/contract';
import { UserId } from '@workspace/domain';
import { BoardId, ManagerId } from '@workspace/domain';

import { ManagerAppointedEvent } from './events/manager-appointed.event';
import { ManagerDismissedEvent } from './events/manager-dismissed.event';
import { ManagerRoleChangedEvent } from './events/manager-role-changed.event';
import {
  CannotDismissMainManagerError,
  InvalidTargetManagerError,
  ManagerCannotTransferToSelfError,
  ManagerNotSubManagerError,
  UserNotMainManagerError,
} from './manager.errors';

import { BoardEntity } from '@/domains/board/domain';
import { UserEntity } from '@/domains/user';

export interface ManagerProps extends BaseEntityProps<ManagerId> {
  boardId: BoardId;
  userId: UserId;
  appointedById: UserId;
  role: ManagerRole;

  user?: UserEntity | undefined;
  board?: BoardEntity | undefined;
}

export interface CreateMainManagerProps {
  boardId: BoardId;
  userId: UserId;
}

export interface CreateSubManagerProps {
  boardId: BoardId;
  userId: UserId;
  actorManager: ManagerEntity;
}

export class ManagerEntity extends BaseAggregateRoot<ManagerProps, ManagerId> {
  private constructor(props: ManagerProps) {
    super({
      id: props.id,
      props,
    });
  }

  get boardId(): BoardId {
    return this.props.boardId;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get role(): ManagerRole {
    return this.props.role;
  }

  get user(): UserEntity | undefined {
    return this.props.user;
  }

  get board(): BoardEntity | undefined {
    return this.props.board;
  }

  public static createMainManager(props: CreateMainManagerProps): ManagerEntity {
    const id = v7() as ManagerId;
    const managerProps: ManagerProps = {
      id,
      boardId: props.boardId,
      userId: props.userId,
      appointedById: props.userId,
      role: MANAGER_ROLE.MAIN_MANAGER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const entity = new ManagerEntity(managerProps);

    entity.addEvent(
      new ManagerAppointedEvent({
        managerId: entity.id,
        boardId: entity.boardId,
        userId: entity.userId,
        appointedById: entity.props.appointedById,
        role: entity.role,
      }),
    );

    return entity;
  }

  public static createSubManager(props: CreateSubManagerProps) {
    // 같은 보드에 속해있어야 함
    if (props.actorManager.boardId !== props.boardId) {
      return err(new InvalidTargetManagerError());
    }

    // 자기 자신은 SubManager로 임명할 수 없음
    if (props.actorManager.userId !== props.userId) {
      return err(new InvalidTargetManagerError());
    }

    // 임명하는 사용자는 MainManager여야 함
    if (props.actorManager.role !== MANAGER_ROLE.MAIN_MANAGER) {
      return err(new UserNotMainManagerError());
    }

    const id = v7() as ManagerId;
    const managerProps: ManagerProps = {
      id,
      boardId: props.boardId,
      userId: props.userId,
      appointedById: props.actorManager.userId,
      role: MANAGER_ROLE.SUB_MANAGER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const entity = new ManagerEntity(managerProps);

    entity.addEvent(
      new ManagerAppointedEvent({
        managerId: entity.id,
        boardId: entity.boardId,
        userId: entity.userId,
        appointedById: entity.props.appointedById,
        role: entity.role,
      }),
    );

    return ok(entity);
  }

  protected updateRole(newRole: ManagerRole): void {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  public static transferMainManager(from: ManagerEntity, to: ManagerEntity) {
    // 같은 보드에 속해있어야 함
    if (from.boardId !== to.boardId) {
      return err(new InvalidTargetManagerError());
    }

    // from은 MainManager여야 함
    if (from.role !== MANAGER_ROLE.MAIN_MANAGER) {
      return err(new UserNotMainManagerError());
    }

    // 스스로에게 양도할 수 없음
    if (from.id === to.id) {
      return err(new ManagerCannotTransferToSelfError());
    }

    // to는 SubManager여야 함
    if (to.role !== MANAGER_ROLE.SUB_MANAGER) {
      return err(new ManagerNotSubManagerError());
    }

    from.updateRole(MANAGER_ROLE.SUB_MANAGER);
    to.updateRole(MANAGER_ROLE.MAIN_MANAGER);

    from.addEvent(
      new ManagerRoleChangedEvent({
        managerId: from.id,
        boardId: from.boardId,
        oldRole: MANAGER_ROLE.MAIN_MANAGER,
        newRole: MANAGER_ROLE.SUB_MANAGER,
        actorId: from.userId,
      }),
    );
    to.addEvent(
      new ManagerRoleChangedEvent({
        managerId: to.id,
        boardId: to.boardId,
        oldRole: MANAGER_ROLE.SUB_MANAGER,
        newRole: MANAGER_ROLE.MAIN_MANAGER,
        actorId: from.userId,
      }),
    );

    return ok({ from, to });
  }

  public delete(mainManager: ManagerEntity) {
    if (this.role === MANAGER_ROLE.MAIN_MANAGER) {
      return err(new CannotDismissMainManagerError());
    }

    if (mainManager.boardId !== this.boardId) {
      return err(new InvalidTargetManagerError());
    }

    if (mainManager.role !== MANAGER_ROLE.MAIN_MANAGER) {
      return err(new UserNotMainManagerError());
    }

    this.addEvent(
      new ManagerDismissedEvent({
        managerId: this.id,
        boardId: this.boardId,
        userId: this.userId,
        dismissedById: mainManager.userId,
      }),
    );

    return ok(this.toDeleted());
  }

  public validate(): void {}
}
