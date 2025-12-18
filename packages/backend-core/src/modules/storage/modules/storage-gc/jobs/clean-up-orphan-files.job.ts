import z from 'zod';

import { defineJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

import { BaseJob, BaseJobProps } from '@/base';

const cleanUpOrphanFilesJobSchema = z.object({});

export type cleanUpOrphanFilesJobProps = BaseJobProps<Record<string, never>>;

export class cleanUpOrphanFilesJob extends BaseJob<cleanUpOrphanFilesJobProps> {
  static readonly code = defineJobCode('system:storage:job:clean_up_orphan_files');
  readonly queueName = TaskQueueCodeEnum.System.Storage;
  readonly schema = cleanUpOrphanFilesJobSchema;
  readonly resourceType = DomainCodeEnums.System.Storage;
}
