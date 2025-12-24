import {
  BaseAccessDeniedError,
  BaseBadRequestError,
  BaseNotFoundError,
} from '@workspace/backend-ddd';

export class ManagerNotFoundError extends BaseNotFoundError<'ManagerNotFound'> {
  public readonly code = 'ManagerNotFound';
  public readonly scope = 'public';
  constructor() {
    super('매니저를 찾을 수 없어요');
  }
}

export class ManagerAlreadyExistsError extends BaseBadRequestError<'ManagerAlreadyExists'> {
  public readonly code = 'ManagerAlreadyExists';
  public readonly scope = 'public';
  constructor() {
    super('매니저가 이미 시스템에 존재해요');
  }
}

export class ManagerNotSubManagerError extends BaseBadRequestError<'ManagerNotSubManager'> {
  public readonly code = 'ManagerNotSubManager';
  public readonly scope = 'public';
  constructor() {
    super('매니저가 Sub 매니저가 아니에요');
  }
}

export class ManagerCannotTransferToSelfError extends BaseBadRequestError<'ManagerCannotTransferToSelf'> {
  public readonly code = 'ManagerCannotTransferToSelf';
  public readonly scope = 'public';
  constructor() {
    super('자신에게 Main Manager 권한을 이전할 수 없어요');
  }
}

export class UserNotManagerError extends BaseAccessDeniedError<'UserNotManager'> {
  public readonly code = 'UserNotManager';
  public readonly scope = 'public';
  constructor() {
    super('해당 유저는 매니저가 아니에요');
  }
}

export class UserNotMainManagerError extends BaseAccessDeniedError<'UserNotMainManager'> {
  public readonly code = 'UserNotMainManager';
  public readonly scope = 'public';
  constructor() {
    super('해당 유저는 메인 매니저가 아니에요');
  }
}

export class CannotDismissMainManagerError extends BaseBadRequestError<'CannotDismissMainManager'> {
  public readonly code = 'CannotDismissMainManager';
  public readonly scope = 'public';
  constructor() {
    super('메인 매니저는 해임할 수 없어요');
  }
}

export class InvalidTargetManagerError extends BaseBadRequestError<'InvalidTargetManager'> {
  public readonly code = 'InvalidTargetManager';
  public readonly scope = 'public';
  constructor() {
    super('유효하지 않은 대상 매니저입니다');
  }
}
