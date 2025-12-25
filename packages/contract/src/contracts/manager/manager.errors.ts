import { defineErrorRecord } from '@/internal/utils/define-api-errors.utils';

export const ManagerApiErrors = defineErrorRecord({
  NotFound: {
    status: 404,
    code: 'MANAGER_NOT_FOUND',
    message: '요청한 매니저를 찾을 수 없습니다',
  },
  NotManager: {
    status: 403,
    code: 'USER_NOT_MANAGER',
    message: '해당 작업을 수행할 매니저 권한이 없습니다',
  },
  NotMainManager: {
    status: 403,
    code: 'USER_NOT_MAIN_MANAGER',
    message: '해당 작업을 수행할 메인 매니저 권한이 없습니다',
  },
  AlreadyManager: {
    status: 409,
    code: 'USER_ALREADY_MANAGER',
    message: '해당 사용자는 이미 매니저로 지정되어 있습니다',
  },
  CannotTransferToSelf: {
    status: 400,
    code: 'CANNOT_TRANSFER_MANAGER_TO_SELF',
    message: '메인 매니저 권한을 자신에게 양도할 수 없습니다',
  },
  CannotDismissMainManager: {
    status: 400,
    code: 'CANNOT_DISMISS_MAIN_MANAGER',
    message: '메인 매니저는 해임할 수 없습니다',
  },
  InvalidTargetManager: {
    status: 400,
    code: 'INVALID_TARGET_MANAGER',
    message: '유효하지 않은 대상 매니저입니다',
  },
});
