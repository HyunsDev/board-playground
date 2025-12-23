import { BaseNotFoundError } from '@workspace/backend-ddd';

export class AuditLogNotFoundError extends BaseNotFoundError<'AuditLogNotFoundError'> {
  readonly scope = 'public';
  readonly code = 'AuditLogNotFoundError' as const;

  constructor(readonly auditLogId: string) {
    super(`Audit log with ID ${auditLogId} not found.`);
  }
}
