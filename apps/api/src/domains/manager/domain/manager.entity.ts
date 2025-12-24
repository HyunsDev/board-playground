import { err, ok } from 'neverthrow';
import { v7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';
import { MANAGER_ROLE, ManagerRole } from '@workspace/contract';

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

export interface ManagerProps extends BaseEntityProps {
  boardId: string;
  userId: string;
  appointedById: string;
  role: ManagerRole;
}

export interface CreateMainManagerProps {
  boardId: string;
  userId: string;
}

export interface CreateSubManagerProps {
  boardId: string;
  userId: string;
  appointedById: string;
}

export class ManagerEntity extends BaseAggregateRoot<ManagerProps> {
  private constructor(props: ManagerProps) {
    super({
      id: props.id,
      props,
    });
  }

  get boardId(): string {
    return this.props.boardId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get role(): ManagerRole {
    return this.props.role;
  }

  public static createMainManager(props: CreateMainManagerProps): ManagerEntity {
    const id = v7();
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

  public static createSubManager(props: CreateSubManagerProps): ManagerEntity {
    const id = v7();
    const managerProps: ManagerProps = {
      id,
      boardId: props.boardId,
      userId: props.userId,
      appointedById: props.appointedById,
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

    return entity;
  }

  protected updateRole(newRole: ManagerRole): void {
    this.props.role = newRole;
    this.props.updatedAt = new Date();
  }

  public static transferMainManager(from: ManagerEntity, to: ManagerEntity) {
    if (from.boardId !== to.boardId) {
      return err(new InvalidTargetManagerError());
    }

    if (from.role !== MANAGER_ROLE.MAIN_MANAGER) {
      return err(new UserNotMainManagerError());
    }

    if (from.id === to.id) {
      return err(new ManagerCannotTransferToSelfError());
    }

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

  public validateDelete(mainManager: ManagerEntity) {
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
    return ok();
  }

  static reconstruct(props: ManagerProps): ManagerEntity {
    return new ManagerEntity(props);
  }

  public validate(): void {}
}
